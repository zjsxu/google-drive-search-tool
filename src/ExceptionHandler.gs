/**
 * ExceptionHandler类
 * 负责统一的异常处理和错误管理
 * 实现需求 3.1, 3.2, 3.3, 3.4
 */

/**
 * ExceptionHandler - 异常处理器核心类
 * 实现权限异常处理逻辑、网络超时重试机制、配额限制处理策略、有意义的错误信息生成
 */
class ExceptionHandler {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1秒基础延迟
      maxDelay: 30000, // 30秒最大延迟
      backoffMultiplier: 2 // 指数退避倍数
    };
    
    this.errorStats = {
      permissionErrors: 0,
      networkTimeouts: 0,
      quotaExceeded: 0,
      otherErrors: 0,
      totalRetries: 0
    };
    
    this.quotaLimitReached = false;
    this.lastQuotaResetTime = null;
  }

  /**
   * 处理权限异常
   * 实现需求 3.1 - 遇到没有读取权限的文件时跳过该文件并继续处理其他文件
   * @param {Error} error - 权限相关异常
   * @param {string} resourceType - 资源类型（'file' 或 'folder'）
   * @param {string} resourceId - 资源ID
   * @param {string} resourceName - 资源名称
   * @return {Object} 处理结果
   */
  handlePermissionError(error, resourceType, resourceId, resourceName = '') {
    this.errorStats.permissionErrors++;
    
    const errorInfo = {
      type: 'PERMISSION_ERROR',
      handled: true,
      shouldContinue: true,
      message: this.generatePermissionErrorMessage(resourceType, resourceName, resourceId),
      originalError: error.message,
      timestamp: new Date().toISOString()
    };

    // 记录权限错误但不中断流程
    console.log(`权限错误处理: ${errorInfo.message}`);
    
    return errorInfo;
  }

  /**
   * 处理网络超时异常并实施重试逻辑
   * 实现需求 3.2 - 发生网络连接超时时实施重试逻辑或跳过当前操作
   * @param {Function} operation - 要重试的操作函数
   * @param {string} operationName - 操作名称
   * @param {Object} context - 操作上下文信息
   * @return {Object} 操作结果
   */
  async handleNetworkTimeoutWithRetry(operation, operationName, context = {}) {
    let lastError = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // 第一次尝试不延迟，后续尝试使用指数退避
        if (attempt > 0) {
          const delay = this.calculateRetryDelay(attempt);
          console.log(`${operationName} 第 ${attempt} 次重试，延迟 ${delay}ms`);
          await this.sleep(delay);
          this.errorStats.totalRetries++;
        }

        // 执行操作
        const result = await operation();
        
        // 如果成功，返回结果
        if (attempt > 0) {
          console.log(`${operationName} 重试成功`);
        }
        
        return {
          success: true,
          result: result,
          attempts: attempt + 1,
          message: attempt > 0 ? `操作在第 ${attempt + 1} 次尝试后成功` : '操作成功'
        };

      } catch (error) {
        lastError = error;
        
        // 检查是否为网络超时错误
        if (this.isNetworkTimeoutError(error)) {
          this.errorStats.networkTimeouts++;
          console.log(`${operationName} 网络超时 (尝试 ${attempt + 1}/${this.retryConfig.maxRetries + 1}): ${error.message}`);
          
          // 如果还有重试机会，继续循环
          if (attempt < this.retryConfig.maxRetries) {
            continue;
          }
        } else {
          // 如果不是网络超时错误，不进行重试
          console.log(`${operationName} 遇到非网络超时错误，停止重试: ${error.message}`);
          break;
        }
      }
    }

    // 所有重试都失败了
    return {
      success: false,
      error: lastError,
      attempts: this.retryConfig.maxRetries + 1,
      message: this.generateNetworkTimeoutErrorMessage(operationName, lastError),
      shouldSkip: true
    };
  }

  /**
   * 处理配额限制异常
   * 实现需求 3.2 - 处理API配额超限异常
   * @param {Error} error - 配额相关异常
   * @param {string} operationName - 操作名称
   * @return {Object} 处理结果
   */
  handleQuotaExceededError(error, operationName) {
    this.errorStats.quotaExceeded++;
    this.quotaLimitReached = true;
    this.lastQuotaResetTime = new Date();

    const errorInfo = {
      type: 'QUOTA_EXCEEDED',
      handled: true,
      shouldPause: true,
      shouldImplementIncremental: true,
      message: this.generateQuotaExceededErrorMessage(operationName),
      originalError: error.message,
      timestamp: new Date().toISOString(),
      suggestedAction: 'IMPLEMENT_INCREMENTAL_SEARCH'
    };

    console.log(`配额限制处理: ${errorInfo.message}`);
    
    return errorInfo;
  }

  /**
   * 处理一般异常情况
   * 实现需求 3.3 - 处理异常情况时记录异常信息但不中断整个搜索过程
   * @param {Error} error - 异常对象
   * @param {string} operationName - 操作名称
   * @param {Object} context - 上下文信息
   * @return {Object} 处理结果
   */
  handleGeneralException(error, operationName, context = {}) {
    this.errorStats.otherErrors++;

    // 分析错误类型
    const errorType = this.analyzeErrorType(error);
    
    const errorInfo = {
      type: errorType,
      handled: true,
      shouldContinue: true,
      message: this.generateGeneralErrorMessage(operationName, error, context),
      originalError: error.message,
      context: context,
      timestamp: new Date().toISOString(),
      severity: this.determineErrorSeverity(error)
    };

    // 根据错误严重程度决定日志级别
    if (errorInfo.severity === 'HIGH') {
      console.error(`严重错误: ${errorInfo.message}`);
    } else {
      console.log(`一般错误: ${errorInfo.message}`);
    }
    
    return errorInfo;
  }

  /**
   * 生成有意义的错误信息
   * 实现需求 3.4 - 提供有意义的错误信息给用户
   * @param {string} errorType - 错误类型
   * @param {Object} errorDetails - 错误详情
   * @return {string} 用户友好的错误信息
   */
  generateUserFriendlyErrorMessage(errorType, errorDetails) {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    switch (errorType) {
      case 'PERMISSION_ERROR':
        return `[${timestamp}] 权限不足：无法访问 ${errorDetails.resourceType} "${errorDetails.resourceName}"。` +
               `这可能是因为文件或文件夹的访问权限设置限制了您的访问。搜索将继续处理其他文件。`;
               
      case 'NETWORK_TIMEOUT':
        return `[${timestamp}] 网络连接超时：执行 "${errorDetails.operationName}" 时网络响应缓慢。` +
               `已尝试重试 ${errorDetails.attempts} 次。建议检查网络连接或稍后重试。`;
               
      case 'QUOTA_EXCEEDED':
        return `[${timestamp}] API配额已达上限：Google Drive API 的使用配额已超出限制。` +
               `建议使用增量搜索功能或等待配额重置后继续。配额通常每24小时重置一次。`;
               
      case 'INVALID_INPUT':
        return `[${timestamp}] 输入参数无效：${errorDetails.details}。` +
               `请检查文件夹ID格式是否正确，搜索关键词是否有效。`;
               
      case 'FILE_NOT_FOUND':
        return `[${timestamp}] 文件或文件夹不存在：指定的资源无法找到。` +
               `请确认文件夹ID是否正确，或者文件是否已被删除或移动。`;
               
      case 'EXECUTION_TIMEOUT':
        return `[${timestamp}] 执行超时：操作执行时间超过了Google Apps Script的限制（6分钟）。` +
               `建议使用增量搜索功能来处理大量文件，或者缩小搜索范围。`;
               
      default:
        return `[${timestamp}] 发生未知错误：${errorDetails.message}。` +
               `如果问题持续存在，请联系技术支持并提供此错误信息。`;
    }
  }

  /**
   * 检查是否为网络超时错误
   * @param {Error} error - 错误对象
   * @return {boolean} 是否为网络超时错误
   */
  isNetworkTimeoutError(error) {
    const timeoutKeywords = [
      'timeout',
      'timed out',
      'connection timeout',
      'request timeout',
      'network error',
      'connection failed',
      'service unavailable'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return timeoutKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * 检查是否为权限错误
   * @param {Error} error - 错误对象
   * @return {boolean} 是否为权限错误
   */
  isPermissionError(error) {
    const permissionKeywords = [
      'permission',
      'access denied',
      'forbidden',
      'unauthorized',
      'insufficient permissions',
      'access not configured'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return permissionKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * 检查是否为配额超限错误
   * @param {Error} error - 错误对象
   * @return {boolean} 是否为配额超限错误
   */
  isQuotaExceededError(error) {
    const quotaKeywords = [
      'quota exceeded',
      'rate limit',
      'too many requests',
      'usage limit',
      'quota limit'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return quotaKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * 分析错误类型
   * @param {Error} error - 错误对象
   * @return {string} 错误类型
   */
  analyzeErrorType(error) {
    if (this.isPermissionError(error)) {
      return 'PERMISSION_ERROR';
    } else if (this.isNetworkTimeoutError(error)) {
      return 'NETWORK_TIMEOUT';
    } else if (this.isQuotaExceededError(error)) {
      return 'QUOTA_EXCEEDED';
    } else if (error.message.includes('not found')) {
      return 'FILE_NOT_FOUND';
    } else if (error.message.includes('invalid') || error.message.includes('malformed')) {
      return 'INVALID_INPUT';
    } else if (error.message.includes('execution timeout') || error.message.includes('script timeout')) {
      return 'EXECUTION_TIMEOUT';
    } else {
      return 'UNKNOWN_ERROR';
    }
  }

  /**
   * 确定错误严重程度
   * @param {Error} error - 错误对象
   * @return {string} 错误严重程度 ('LOW', 'MEDIUM', 'HIGH')
   */
  determineErrorSeverity(error) {
    const errorType = this.analyzeErrorType(error);
    
    switch (errorType) {
      case 'PERMISSION_ERROR':
      case 'FILE_NOT_FOUND':
        return 'LOW'; // 这些错误通常可以跳过继续处理
        
      case 'NETWORK_TIMEOUT':
      case 'INVALID_INPUT':
        return 'MEDIUM'; // 这些错误可能需要重试或用户干预
        
      case 'QUOTA_EXCEEDED':
      case 'EXECUTION_TIMEOUT':
        return 'HIGH'; // 这些错误需要改变执行策略
        
      default:
        return 'MEDIUM';
    }
  }

  /**
   * 计算重试延迟时间（指数退避）
   * @param {number} attempt - 当前尝试次数
   * @return {number} 延迟时间（毫秒）
   */
  calculateRetryDelay(attempt) {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * 睡眠函数
   * @param {number} ms - 睡眠时间（毫秒）
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成权限错误信息
   * @param {string} resourceType - 资源类型
   * @param {string} resourceName - 资源名称
   * @param {string} resourceId - 资源ID
   * @return {string} 错误信息
   */
  generatePermissionErrorMessage(resourceType, resourceName, resourceId) {
    const displayName = resourceName || resourceId;
    return `无法访问${resourceType === 'file' ? '文件' : '文件夹'} "${displayName}"，权限不足，已跳过`;
  }

  /**
   * 生成网络超时错误信息
   * @param {string} operationName - 操作名称
   * @param {Error} error - 错误对象
   * @return {string} 错误信息
   */
  generateNetworkTimeoutErrorMessage(operationName, error) {
    return `执行 "${operationName}" 时网络超时，已重试 ${this.retryConfig.maxRetries} 次仍然失败，已跳过此操作`;
  }

  /**
   * 生成配额超限错误信息
   * @param {string} operationName - 操作名称
   * @return {string} 错误信息
   */
  generateQuotaExceededErrorMessage(operationName) {
    return `执行 "${operationName}" 时达到API配额限制，建议使用增量搜索或等待配额重置`;
  }

  /**
   * 生成一般错误信息
   * @param {string} operationName - 操作名称
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   * @return {string} 错误信息
   */
  generateGeneralErrorMessage(operationName, error, context) {
    let message = `执行 "${operationName}" 时发生错误: ${error.message}`;
    
    if (context.resourceName) {
      message += ` (资源: ${context.resourceName})`;
    }
    
    message += '，已跳过此操作继续处理';
    
    return message;
  }

  /**
   * 获取错误统计信息
   * @return {Object} 错误统计数据
   */
  getErrorStatistics() {
    return {
      ...this.errorStats,
      quotaLimitReached: this.quotaLimitReached,
      lastQuotaResetTime: this.lastQuotaResetTime
    };
  }

  /**
   * 重置错误统计信息
   */
  resetErrorStatistics() {
    this.errorStats = {
      permissionErrors: 0,
      networkTimeouts: 0,
      quotaExceeded: 0,
      otherErrors: 0,
      totalRetries: 0
    };
    this.quotaLimitReached = false;
    this.lastQuotaResetTime = null;
  }

  /**
   * 检查是否应该暂停操作（由于配额限制）
   * @return {boolean} 是否应该暂停
   */
  shouldPauseOperations() {
    return this.quotaLimitReached;
  }

  /**
   * 获取建议的错误处理策略
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   * @return {Object} 处理策略
   */
  getErrorHandlingStrategy(error, context = {}) {
    const errorType = this.analyzeErrorType(error);
    
    const strategies = {
      'PERMISSION_ERROR': {
        action: 'SKIP',
        shouldContinue: true,
        shouldRetry: false,
        userMessage: '跳过无权限访问的资源'
      },
      'NETWORK_TIMEOUT': {
        action: 'RETRY',
        shouldContinue: true,
        shouldRetry: true,
        maxRetries: this.retryConfig.maxRetries,
        userMessage: '网络超时，将进行重试'
      },
      'QUOTA_EXCEEDED': {
        action: 'PAUSE_AND_IMPLEMENT_INCREMENTAL',
        shouldContinue: false,
        shouldRetry: false,
        userMessage: 'API配额已满，建议使用增量搜索'
      },
      'FILE_NOT_FOUND': {
        action: 'SKIP',
        shouldContinue: true,
        shouldRetry: false,
        userMessage: '文件不存在，已跳过'
      },
      'INVALID_INPUT': {
        action: 'STOP',
        shouldContinue: false,
        shouldRetry: false,
        userMessage: '输入参数无效，请检查后重试'
      },
      'EXECUTION_TIMEOUT': {
        action: 'IMPLEMENT_INCREMENTAL',
        shouldContinue: false,
        shouldRetry: false,
        userMessage: '执行超时，建议使用增量搜索'
      }
    };

    return strategies[errorType] || {
      action: 'SKIP',
      shouldContinue: true,
      shouldRetry: false,
      userMessage: '发生未知错误，已跳过'
    };
  }

  /**
   * 统一的错误处理入口
   * @param {Error} error - 错误对象
   * @param {string} operationName - 操作名称
   * @param {Object} context - 上下文信息
   * @return {Object} 处理结果
   */
  handleError(error, operationName, context = {}) {
    const errorType = this.analyzeErrorType(error);
    
    switch (errorType) {
      case 'PERMISSION_ERROR':
        return this.handlePermissionError(
          error, 
          context.resourceType || 'resource', 
          context.resourceId || 'unknown',
          context.resourceName || ''
        );
        
      case 'QUOTA_EXCEEDED':
        return this.handleQuotaExceededError(error, operationName);
        
      default:
        return this.handleGeneralException(error, operationName, context);
    }
  }

  /**
   * 包装操作以提供统一的错误处理
   * @param {Function} operation - 要执行的操作
   * @param {string} operationName - 操作名称
   * @param {Object} context - 上下文信息
   * @return {Object} 操作结果
   */
  async wrapOperation(operation, operationName, context = {}) {
    try {
      const result = await operation();
      return {
        success: true,
        result: result
      };
    } catch (error) {
      const errorInfo = this.handleError(error, operationName, context);
      
      return {
        success: false,
        error: errorInfo,
        shouldContinue: errorInfo.shouldContinue !== false
      };
    }
  }
}

/**
 * 创建ExceptionHandler实例的工厂函数
 * @return {ExceptionHandler} ExceptionHandler实例
 */
function createExceptionHandler() {
  return new ExceptionHandler();
}

/**
 * 全局异常处理器实例（单例模式）
 */
let globalExceptionHandler = null;

/**
 * 获取全局异常处理器实例
 * @return {ExceptionHandler} 全局异常处理器实例
 */
function getGlobalExceptionHandler() {
  if (!globalExceptionHandler) {
    globalExceptionHandler = createExceptionHandler();
  }
  return globalExceptionHandler;
}