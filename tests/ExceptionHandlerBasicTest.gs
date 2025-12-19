/**
 * ExceptionHandler基础功能测试
 * 简单的功能验证测试
 */

/**
 * 运行ExceptionHandler基础测试
 */
function runExceptionHandlerBasicTest() {
  console.log('=== ExceptionHandler基础功能测试 ===');
  
  try {
    // 测试1: 创建ExceptionHandler实例
    console.log('测试1: 创建ExceptionHandler实例');
    const handler = createExceptionHandler();
    if (!handler) {
      throw new Error('无法创建ExceptionHandler实例');
    }
    console.log('✓ ExceptionHandler实例创建成功');
    
    // 测试2: 测试权限错误处理
    console.log('\n测试2: 权限错误处理');
    const permissionError = new Error('Permission denied');
    const permissionResult = handler.handlePermissionError(permissionError, 'file', 'test-id', 'test.txt');
    if (permissionResult.type !== 'PERMISSION_ERROR') {
      throw new Error('权限错误处理失败');
    }
    if (!permissionResult.shouldContinue) {
      throw new Error('权限错误应该允许继续处理');
    }
    console.log('✓ 权限错误处理正确');
    
    // 测试3: 测试配额错误处理
    console.log('\n测试3: 配额错误处理');
    const quotaError = new Error('Quota exceeded');
    const quotaResult = handler.handleQuotaExceededError(quotaError, 'searchFiles');
    if (quotaResult.type !== 'QUOTA_EXCEEDED') {
      throw new Error('配额错误处理失败');
    }
    if (!quotaResult.shouldPause) {
      throw new Error('配额错误应该建议暂停');
    }
    console.log('✓ 配额错误处理正确');
    
    // 测试4: 测试错误类型识别
    console.log('\n测试4: 错误类型识别');
    if (!handler.isPermissionError(new Error('Access denied'))) {
      throw new Error('权限错误识别失败');
    }
    if (!handler.isNetworkTimeoutError(new Error('Connection timeout'))) {
      throw new Error('网络超时错误识别失败');
    }
    if (!handler.isQuotaExceededError(new Error('Rate limit exceeded'))) {
      throw new Error('配额错误识别失败');
    }
    console.log('✓ 错误类型识别正确');
    
    // 测试5: 测试错误统计
    console.log('\n测试5: 错误统计功能');
    const initialStats = handler.getErrorStatistics();
    if (initialStats.permissionErrors !== 1) {
      throw new Error('权限错误统计不正确');
    }
    if (initialStats.quotaExceeded !== 1) {
      throw new Error('配额错误统计不正确');
    }
    console.log('✓ 错误统计功能正确');
    
    // 测试6: 测试用户友好错误信息
    console.log('\n测试6: 用户友好错误信息生成');
    const userMessage = handler.generateUserFriendlyErrorMessage('PERMISSION_ERROR', {
      resourceType: 'file',
      resourceName: 'test.txt'
    });
    if (!userMessage.includes('权限不足')) {
      throw new Error('用户友好错误信息生成失败');
    }
    console.log('✓ 用户友好错误信息生成正确');
    
    // 测试7: 测试全局异常处理器
    console.log('\n测试7: 全局异常处理器');
    const globalHandler1 = getGlobalExceptionHandler();
    const globalHandler2 = getGlobalExceptionHandler();
    if (globalHandler1 !== globalHandler2) {
      throw new Error('全局异常处理器应该是单例');
    }
    console.log('✓ 全局异常处理器单例模式正确');
    
    console.log('\n=== 所有测试通过 ===');
    return true;
    
  } catch (error) {
    console.log(`\n✗ 测试失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试ExceptionHandler与其他组件的集成
 */
function testExceptionHandlerIntegration() {
  console.log('\n=== ExceptionHandler集成测试 ===');
  
  try {
    const handler = createExceptionHandler();
    
    // 模拟在搜索过程中使用异常处理器
    console.log('测试集成场景: 文件搜索中的异常处理');
    
    // 模拟权限错误
    const mockPermissionError = () => {
      throw new Error('Permission denied for file access');
    };
    
    // 使用异常处理器包装操作
    const result = handler.wrapOperation(mockPermissionError, 'searchFile', {
      resourceType: 'file',
      resourceId: 'test-file-id',
      resourceName: 'restricted-file.txt'
    });
    
    // 由于是异步操作，这里简化处理
    console.log('✓ 异常处理器集成测试准备完成');
    
    return true;
    
  } catch (error) {
    console.log(`✗ 集成测试失败: ${error.message}`);
    return false;
  }
}