/**
 * 运行任务 5.2: 异常处理稳定性属性测试
 * **Feature: google-drive-search-tool, Property 6: 异常处理稳定性**
 * **验证: 需求 3.1, 3.3**
 */
function runTask5_2_ExceptionHandlingStabilityPropertyTest() {
  console.log('\n=== 任务 5.2: 异常处理稳定性属性测试 ===');
  
  try {
    // **Feature: google-drive-search-tool, Property 6: 异常处理稳定性**
    // **验证: 需求 3.1, 3.3**
    
    console.log('运行属性测试: 属性 6: 异常处理稳定性');
    let passed = 0;
    let failed = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      try {
        // Property test function
        const handler = createExceptionHandler();
        
        // 生成随机的错误类型和上下文
        const errorTypes = [
          { type: 'permission', message: 'Permission denied', shouldContinue: true },
          { type: 'permission', message: 'Access denied', shouldContinue: true },
          { type: 'permission', message: 'Forbidden', shouldContinue: true },
          { type: 'network', message: 'Connection timeout', shouldContinue: true },
          { type: 'network', message: 'Request timed out', shouldContinue: true },
          { type: 'quota', message: 'Quota exceeded', shouldContinue: false },
          { type: 'quota', message: 'Rate limit exceeded', shouldContinue: false },
          { type: 'general', message: 'File not found', shouldContinue: true },
          { type: 'general', message: 'Invalid parameter', shouldContinue: true },
          { type: 'general', message: 'Service unavailable', shouldContinue: true }
        ];
        
        const randomErrorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        const error = new Error(randomErrorType.message);
        
        // 生成随机的操作上下文
        const operationNames = ['searchFiles', 'getFileContent', 'traverseFolder', 'validateAccess'];
        const randomOperationName = operationNames[Math.floor(Math.random() * operationNames.length)];
        
        const resourceTypes = ['file', 'folder'];
        const randomResourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        
        // Generate random resource ID and name inline
        const generateRandomId = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          const length = Math.floor(Math.random() * 17) + 28; // 28-44 characters
          for (let j = 0; j < length; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        
        const generateRandomString = (minLength, maxLength) => {
          const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let j = 0; j < length; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        
        const context = {
          resourceType: randomResourceType,
          resourceId: generateRandomId(),
          resourceName: generateRandomString(5, 20) + (randomResourceType === 'file' ? '.txt' : '')
        };
        
        // 对于任何权限受限或无法访问的文件，系统应该跳过该文件并继续处理其他文件而不中断整个搜索过程
        let result;
        
        if (randomErrorType.type === 'permission') {
          // 测试权限错误处理 (需求 3.1)
          result = handler.handlePermissionError(error, context.resourceType, context.resourceId, context.resourceName);
          
          // 验证权限错误处理的稳定性
          if (result.type !== 'PERMISSION_ERROR') {
            throw new Error('权限错误类型应该正确识别');
          }
          if (!result.handled) {
            throw new Error('权限错误应该被标记为已处理');
          }
          if (!result.shouldContinue) {
            throw new Error('权限错误应该允许继续处理其他文件');
          }
          if (!result.message) {
            throw new Error('应该提供错误信息');
          }
          if (!result.message.includes(context.resourceName) && !result.message.includes(context.resourceId)) {
            throw new Error('错误信息应该包含资源标识');
          }
          
        } else if (randomErrorType.type === 'quota') {
          // 测试配额错误处理
          result = handler.handleQuotaExceededError(error, randomOperationName);
          
          // 验证配额错误处理的稳定性
          if (result.type !== 'QUOTA_EXCEEDED') {
            throw new Error('配额错误类型应该正确识别');
          }
          if (!result.handled) {
            throw new Error('配额错误应该被标记为已处理');
          }
          if (!result.shouldPause) {
            throw new Error('配额错误应该建议暂停操作');
          }
          if (!result.message) {
            throw new Error('应该提供错误信息');
          }
          
        } else {
          // 测试一般异常处理 (需求 3.3)
          result = handler.handleGeneralException(error, randomOperationName, context);
          
          // 验证一般异常处理的稳定性
          if (!result.handled) {
            throw new Error('一般异常应该被标记为已处理');
          }
          if (!result.shouldContinue) {
            throw new Error('一般异常应该允许继续处理');
          }
          if (!result.message) {
            throw new Error('应该提供错误信息');
          }
          if (!result.message.includes(randomOperationName)) {
            throw new Error('错误信息应该包含操作名称');
          }
        }
        
        // 验证通用的异常处理稳定性属性
        if (!result) {
          throw new Error('异常处理结果不应为null');
        }
        if (!result.handled) {
          throw new Error('所有异常都应该被标记为已处理');
        }
        if (!result.timestamp) {
          throw new Error('应该记录异常发生时间');
        }
        if (!result.originalError) {
          throw new Error('应该保留原始错误信息');
        }
        
        // 验证错误统计功能正常工作
        const stats = handler.getErrorStatistics();
        if (!stats) {
          throw new Error('错误统计信息应该存在');
        }
        if (typeof stats.permissionErrors !== 'number') {
          throw new Error('权限错误计数应该是数字');
        }
        if (typeof stats.quotaExceeded !== 'number') {
          throw new Error('配额错误计数应该是数字');
        }
        if (typeof stats.otherErrors !== 'number') {
          throw new Error('其他错误计数应该是数字');
        }
        
        // 验证系统在处理异常后仍然可以继续工作
        const testError = new Error('Test error for stability check');
        const stabilityResult = handler.handleGeneralException(testError, 'stabilityTest');
        if (!stabilityResult.handled) {
          throw new Error('处理异常后系统应该仍然稳定工作');
        }
        
        // 验证异常处理不会影响后续操作
        const secondStats = handler.getErrorStatistics();
        if (secondStats.otherErrors < stats.otherErrors) {
          throw new Error('错误统计应该正确更新');
        }
        
        passed++;
      } catch (error) {
        failed++;
        console.log(`迭代 ${i + 1} 失败: ${error.message}`);
        // 对于属性测试，记录第一个失败就停止
        if (failed === 1) {
          console.log(`属性测试失败，反例在迭代 ${i + 1}`);
          throw error;
        }
      }
    }

    console.log(`属性测试完成: ${passed}/${iterations} 通过`);
    
    console.log('✓ 任务 5.2: 异常处理稳定性属性测试通过');
    return true;
    
  } catch (error) {
    console.log(`✗ 任务 5.2: 异常处理稳定性属性测试失败: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

/**
 * 简化版异常处理稳定性测试（用于快速验证）
 */
function runTask5_2_BasicTest() {
  console.log('\n=== 任务 5.2: 异常处理稳定性基础测试 ===');
  
  try {
    const handler = createExceptionHandler();
    
    // 测试权限错误处理稳定性
    const permissionError = new Error('Permission denied');
    const permissionResult = handler.handlePermissionError(permissionError, 'file', 'test-id', 'test.txt');
    
    if (permissionResult.type !== 'PERMISSION_ERROR') {
      throw new Error('权限错误类型应该正确');
    }
    if (!permissionResult.handled) {
      throw new Error('权限错误应该被处理');
    }
    if (!permissionResult.shouldContinue) {
      throw new Error('权限错误应该允许继续');
    }
    
    // 测试一般异常处理稳定性
    const generalError = new Error('General error');
    const generalResult = handler.handleGeneralException(generalError, 'testOperation');
    
    if (!generalResult.handled) {
      throw new Error('一般异常应该被处理');
    }
    if (!generalResult.shouldContinue) {
      throw new Error('一般异常应该允许继续');
    }
    
    // 验证错误统计
    const stats = handler.getErrorStatistics();
    if (stats.permissionErrors !== 1) {
      throw new Error('权限错误计数应该正确');
    }
    if (stats.otherErrors !== 1) {
      throw new Error('其他错误计数应该正确');
    }
    
    console.log('✓ 异常处理稳定性基础测试通过');
    return true;
    
  } catch (error) {
    console.log(`✗ 异常处理稳定性基础测试失败: ${error.message}`);
    return false;
  }
}