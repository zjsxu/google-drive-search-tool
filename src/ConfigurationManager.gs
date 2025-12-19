/**
 * ConfigurationManager类
 * 负责搜索配置参数管理和默认设置
 * 实现需求 4.4, 4.5
 */

/**
 * ConfigurationManager - 配置管理器核心类
 * 实现搜索配置参数管理、默认设置和用户自定义选项
 */
class ConfigurationManager {
  constructor() {
    this.defaultConfig = this.getDefaultConfiguration();
    this.userConfig = {};
    this.currentConfig = null;
  }

  /**
   * 获取默认配置
   * 实现需求 4.4, 4.5 - 默认设置和用户自定义选项
   * @return {Object} 默认配置对象
   */
  getDefaultConfiguration() {
    return {
      // 搜索相关配置
      search: {
        maxResults: 1000,
        timeoutMinutes: 5,
        enableIncremental: true,
        batchSize: 50,
        maxDepth: 20
      },
      
      // 文件类型配置
      fileTypes: {
        supportedMimeTypes: [
          'application/vnd.google-apps.document',      // Google Docs
          'application/pdf',                           // PDF
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
          'text/plain',                               // TXT
          'application/vnd.google-apps.spreadsheet'   // Google Sheets
        ],
        enableAllTypes: false,
        customTypes: []
      },
      
      // 输出配置
      output: {
        defaultFormat: 'logger',
        sheetNameTemplate: '搜索结果_{date}',
        includeStatistics: true,
        maxBatchSize: 100,
        autoResizeColumns: true
      },
      
      // 性能配置
      performance: {
        enableMonitoring: true,
        checkpointInterval: 100,
        nearTimeoutThreshold: 0.8,
        retryAttempts: 3,
        retryDelay: 1000
      },
      
      // 错误处理配置
      errorHandling: {
        skipPermissionErrors: true,
        skipNetworkErrors: false,
        logErrorDetails: true,
        continueOnError: true,
        maxErrorsBeforeStop: 50
      },
      
      // 增量搜索配置
      incremental: {
        enabled: true,
        defaultBatchSize: 50,
        saveProgressInterval: 100,
        maxExecutionTime: 300000, // 5分钟（毫秒）
        enableProgressSaving: true
      }
    };
  }

  /**
   * 设置用户配置
   * @param {Object} userConfig - 用户自定义配置
   */
  setUserConfiguration(userConfig) {
    this.userConfig = this.deepMerge(this.userConfig, userConfig);
    this.currentConfig = this.mergeConfigurations();
    console.log('用户配置已更新');
  }

  /**
   * 获取当前有效配置
   * @return {Object} 当前配置对象
   */
  getCurrentConfiguration() {
    if (!this.currentConfig) {
      this.currentConfig = this.mergeConfigurations();
    }
    return this.currentConfig;
  }

  /**
   * 合并默认配置和用户配置
   * @return {Object} 合并后的配置
   */
  mergeConfigurations() {
    return this.deepMerge(this.defaultConfig, this.userConfig);
  }

  /**
   * 深度合并对象
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @return {Object} 合并后的对象
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * 获取搜索配置
   * @return {Object} 搜索相关配置
   */
  getSearchConfig() {
    return this.getCurrentConfiguration().search;
  }

  /**
   * 获取文件类型配置
   * @return {Object} 文件类型相关配置
   */
  getFileTypesConfig() {
    return this.getCurrentConfiguration().fileTypes;
  }

  /**
   * 获取输出配置
   * @return {Object} 输出相关配置
   */
  getOutputConfig() {
    return this.getCurrentConfiguration().output;
  }

  /**
   * 获取性能配置
   * @return {Object} 性能相关配置
   */
  getPerformanceConfig() {
    return this.getCurrentConfiguration().performance;
  }

  /**
   * 获取错误处理配置
   * @return {Object} 错误处理相关配置
   */
  getErrorHandlingConfig() {
    return this.getCurrentConfiguration().errorHandling;
  }

  /**
   * 获取增量搜索配置
   * @return {Object} 增量搜索相关配置
   */
  getIncrementalConfig() {
    return this.getCurrentConfiguration().incremental;
  }

  /**
   * 设置搜索配置
   * @param {Object} searchConfig - 搜索配置
   */
  setSearchConfig(searchConfig) {
    this.setUserConfiguration({ search: searchConfig });
  }

  /**
   * 设置输出格式
   * @param {string} format - 输出格式 ('logger' 或 'sheet')
   */
  setOutputFormat(format) {
    if (format === 'logger' || format === 'sheet') {
      this.setUserConfiguration({ 
        output: { defaultFormat: format } 
      });
      console.log(`输出格式设置为: ${format}`);
    } else {
      console.log(`无效的输出格式: ${format}`);
    }
  }

  /**
   * 启用或禁用增量搜索
   * @param {boolean} enabled - 是否启用
   */
  setIncrementalSearchEnabled(enabled) {
    this.setUserConfiguration({ 
      incremental: { enabled: enabled } 
    });
    console.log(`增量搜索${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * 设置批量处理大小
   * @param {number} batchSize - 批量大小
   */
  setBatchSize(batchSize) {
    if (typeof batchSize === 'number' && batchSize > 0) {
      this.setUserConfiguration({ 
        search: { batchSize: batchSize },
        incremental: { defaultBatchSize: batchSize }
      });
      console.log(`批量处理大小设置为: ${batchSize}`);
    } else {
      console.log(`无效的批量大小: ${batchSize}`);
    }
  }

  /**
   * 设置最大结果数量
   * @param {number} maxResults - 最大结果数量
   */
  setMaxResults(maxResults) {
    if (typeof maxResults === 'number' && maxResults > 0) {
      this.setUserConfiguration({ 
        search: { maxResults: maxResults } 
      });
      console.log(`最大结果数量设置为: ${maxResults}`);
    } else {
      console.log(`无效的最大结果数量: ${maxResults}`);
    }
  }

  /**
   * 添加自定义文件类型
   * @param {string} mimeType - MIME类型
   * @param {string} displayName - 显示名称
   */
  addCustomFileType(mimeType, displayName) {
    const currentTypes = this.getFileTypesConfig().customTypes || [];
    const newType = { mimeType: mimeType, displayName: displayName };
    
    // 检查是否已存在
    const exists = currentTypes.some(type => type.mimeType === mimeType);
    if (!exists) {
      currentTypes.push(newType);
      this.setUserConfiguration({ 
        fileTypes: { customTypes: currentTypes } 
      });
      console.log(`已添加自定义文件类型: ${displayName} (${mimeType})`);
    } else {
      console.log(`文件类型已存在: ${mimeType}`);
    }
  }

  /**
   * 移除自定义文件类型
   * @param {string} mimeType - MIME类型
   */
  removeCustomFileType(mimeType) {
    const currentTypes = this.getFileTypesConfig().customTypes || [];
    const filteredTypes = currentTypes.filter(type => type.mimeType !== mimeType);
    
    if (filteredTypes.length < currentTypes.length) {
      this.setUserConfiguration({ 
        fileTypes: { customTypes: filteredTypes } 
      });
      console.log(`已移除自定义文件类型: ${mimeType}`);
    } else {
      console.log(`未找到文件类型: ${mimeType}`);
    }
  }

  /**
   * 获取所有支持的文件类型
   * @return {string[]} 支持的MIME类型数组
   */
  getAllSupportedFileTypes() {
    const config = this.getFileTypesConfig();
    const supportedTypes = [...config.supportedMimeTypes];
    
    // 添加自定义类型
    if (config.customTypes && config.customTypes.length > 0) {
      const customMimeTypes = config.customTypes.map(type => type.mimeType);
      supportedTypes.push(...customMimeTypes);
    }
    
    return supportedTypes;
  }

  /**
   * 验证配置的有效性
   * @param {Object} config - 要验证的配置
   * @return {Object} 验证结果
   */
  validateConfiguration(config) {
    const errors = [];
    const warnings = [];
    
    // 验证搜索配置
    if (config.search) {
      if (config.search.maxResults && (typeof config.search.maxResults !== 'number' || config.search.maxResults <= 0)) {
        errors.push('search.maxResults 必须是正数');
      }
      
      if (config.search.batchSize && (typeof config.search.batchSize !== 'number' || config.search.batchSize <= 0)) {
        errors.push('search.batchSize 必须是正数');
      }
      
      if (config.search.maxDepth && (typeof config.search.maxDepth !== 'number' || config.search.maxDepth <= 0)) {
        errors.push('search.maxDepth 必须是正数');
      }
    }
    
    // 验证输出配置
    if (config.output) {
      if (config.output.defaultFormat && !['logger', 'sheet'].includes(config.output.defaultFormat)) {
        errors.push('output.defaultFormat 必须是 "logger" 或 "sheet"');
      }
      
      if (config.output.maxBatchSize && (typeof config.output.maxBatchSize !== 'number' || config.output.maxBatchSize <= 0)) {
        errors.push('output.maxBatchSize 必须是正数');
      }
    }
    
    // 验证文件类型配置
    if (config.fileTypes && config.fileTypes.customTypes) {
      if (!Array.isArray(config.fileTypes.customTypes)) {
        errors.push('fileTypes.customTypes 必须是数组');
      } else {
        config.fileTypes.customTypes.forEach((type, index) => {
          if (!type.mimeType || typeof type.mimeType !== 'string') {
            errors.push(`fileTypes.customTypes[${index}].mimeType 必须是字符串`);
          }
          if (!type.displayName || typeof type.displayName !== 'string') {
            errors.push(`fileTypes.customTypes[${index}].displayName 必须是字符串`);
          }
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * 重置为默认配置
   */
  resetToDefault() {
    this.userConfig = {};
    this.currentConfig = null;
    console.log('配置已重置为默认值');
  }

  /**
   * 导出当前配置
   * @return {string} JSON格式的配置字符串
   */
  exportConfiguration() {
    const config = this.getCurrentConfiguration();
    return JSON.stringify(config, null, 2);
  }

  /**
   * 从JSON字符串导入配置
   * @param {string} configJson - JSON格式的配置字符串
   * @return {boolean} 导入是否成功
   */
  importConfiguration(configJson) {
    try {
      const config = JSON.parse(configJson);
      const validation = this.validateConfiguration(config);
      
      if (validation.isValid) {
        this.setUserConfiguration(config);
        console.log('配置导入成功');
        return true;
      } else {
        console.log('配置验证失败:', validation.errors.join(', '));
        return false;
      }
    } catch (error) {
      console.log('配置导入失败:', error.message);
      return false;
    }
  }

  /**
   * 获取配置摘要信息
   * @return {Object} 配置摘要
   */
  getConfigurationSummary() {
    const config = this.getCurrentConfiguration();
    
    return {
      searchConfig: {
        maxResults: config.search.maxResults,
        batchSize: config.search.batchSize,
        incrementalEnabled: config.incremental.enabled
      },
      outputConfig: {
        defaultFormat: config.output.defaultFormat,
        includeStatistics: config.output.includeStatistics
      },
      fileTypesConfig: {
        supportedTypesCount: config.fileTypes.supportedMimeTypes.length,
        customTypesCount: (config.fileTypes.customTypes || []).length
      },
      performanceConfig: {
        monitoringEnabled: config.performance.enableMonitoring,
        retryAttempts: config.performance.retryAttempts
      }
    };
  }

  /**
   * 创建针对特定搜索的配置
   * @param {Object} searchOptions - 搜索选项
   * @return {Object} 搜索专用配置
   */
  createSearchSpecificConfig(searchOptions = {}) {
    const baseConfig = this.getCurrentConfiguration();
    
    // 合并搜索特定选项
    const searchConfig = this.deepMerge(baseConfig, {
      search: {
        maxResults: searchOptions.maxResults || baseConfig.search.maxResults,
        batchSize: searchOptions.batchSize || baseConfig.search.batchSize,
        maxDepth: searchOptions.maxDepth || baseConfig.search.maxDepth
      },
      output: {
        defaultFormat: searchOptions.outputFormat || baseConfig.output.defaultFormat
      },
      incremental: {
        enabled: searchOptions.useIncremental !== undefined ? searchOptions.useIncremental : baseConfig.incremental.enabled
      }
    });
    
    return searchConfig;
  }
}

/**
 * 创建ConfigurationManager实例的工厂函数
 * @return {ConfigurationManager} ConfigurationManager实例
 */
function createConfigurationManager() {
  return new ConfigurationManager();
}

/**
 * 全局配置管理器实例（单例模式）
 */
let globalConfigurationManager = null;

/**
 * 获取全局配置管理器实例
 * @return {ConfigurationManager} 全局配置管理器实例
 */
function getGlobalConfigurationManager() {
  if (!globalConfigurationManager) {
    globalConfigurationManager = createConfigurationManager();
  }
  return globalConfigurationManager;
}

/**
 * 快速配置函数 - 提供常用配置的快捷设置
 */

/**
 * 设置快速搜索配置（适合小型文件夹）
 */
function setQuickSearchConfig() {
  const configManager = getGlobalConfigurationManager();
  configManager.setUserConfiguration({
    search: {
      maxResults: 500,
      batchSize: 25,
      maxDepth: 10
    },
    incremental: {
      enabled: false
    },
    performance: {
      checkpointInterval: 50
    }
  });
  console.log('已设置快速搜索配置');
}

/**
 * 设置深度搜索配置（适合大型文件夹）
 */
function setDeepSearchConfig() {
  const configManager = getGlobalConfigurationManager();
  configManager.setUserConfiguration({
    search: {
      maxResults: 5000,
      batchSize: 100,
      maxDepth: 50
    },
    incremental: {
      enabled: true,
      defaultBatchSize: 100
    },
    performance: {
      checkpointInterval: 200
    }
  });
  console.log('已设置深度搜索配置');
}

/**
 * 设置性能优先配置
 */
function setPerformanceOptimizedConfig() {
  const configManager = getGlobalConfigurationManager();
  configManager.setUserConfiguration({
    search: {
      batchSize: 200,
      maxResults: 2000
    },
    incremental: {
      enabled: true,
      defaultBatchSize: 200
    },
    output: {
      maxBatchSize: 200
    },
    performance: {
      checkpointInterval: 500,
      retryAttempts: 1
    }
  });
  console.log('已设置性能优先配置');
}