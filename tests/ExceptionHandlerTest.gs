/**
 * ExceptionHandler类的测试
 * 测试异常处理和错误管理功能
 */

/**
 * 运行ExceptionHandler的所有测试
 */
function runExceptionHandlerTests() {
  const suite = new TestSuite('ExceptionHandler Tests');
  
  // 基础功能测试
  suite.addTest('测试ExceptionHandler创建', testExceptionHandlerCreation);
  suite.addTest('测试权限错误处理', testPermissionErrorHandling);
  suite.addTest('测试配额超限错误处理', testQuotaExceededErrorHandling);
  suite.addTest('测试一般异常处理', testGeneralExceptionHandling);
  suite.addTest('测试错误类型分析', testErrorTypeAnalysis);
  suite.addTest('测试用户友好错误信息生成', testUserFriendlyErrorMessages);
  suite.addTest('测试错误统计功能', testErrorStatistics);
  suite.addTest('测试错误处理策略', testErrorHandlingStrategy);
  
  suite.run();
}

/**
 * 测试ExceptionHandler实例创建
 */
function testExceptionHandlerCreation() {
  const handler = createExceptionHandler();
  
  Assert.assertNotNull(handler, 'ExceptionHandler实例应该被成功创建');
  Assert.assertTrue(typeof handler.handlePermissionError === 'function', '应该有handlePermissionError方法');
  Assert.assertTrue(typeof handler.handleQuotaExceededError === 'function', '应该有handleQuotaExceededError方法');
  Assert.assertTrue(typeof handler.handleGeneralException === 'function', '应该有handleGeneralException方法');
  
  const stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.permissionErrors, 0, '初始权限错误计数应为0');
  Assert.assertEquals(stats.quotaExceeded, 0, '初始配额错误计数应为0');
}

/**
 * 测试权限错误处理
 */
function testPermissionErrorHandling() {
  const handler = createExceptionHandler();
  const error = new Error('Permission denied');
  
  const result = handler.handlePermissionError(error, 'file', 'test-file-id', 'test-file.txt');
  
  Assert.assertEquals(result.type, 'PERMISSION_ERROR', '错误类型应为PERMISSION_ERROR');
  Assert.assertTrue(result.handled, '错误应被标记为已处理');
  Assert.assertTrue(result.shouldContinue, '应该继续处理其他文件');
  Assert.assertTrue(result.message.includes('test-file.txt'), '错误信息应包含文件名');
  
  const stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.permissionErrors, 1, '权限错误计数应增加');
}

/**
 * 测试配额超限错误处理
 */
function testQuotaExceededErrorHandling() {
  const handler = createExceptionHandler();
  const error = new Error('Quota exceeded');
  
  const result = handler.handleQuotaExceededError(error, 'searchFiles');
  
  Assert.assertEquals(result.type, 'QUOTA_EXCEEDED', '错误类型应为QUOTA_EXCEEDED');
  Assert.assertTrue(result.handled, '错误应被标记为已处理');
  Assert.assertTrue(result.shouldPause, '应该暂停操作');
  Assert.assertTrue(result.shouldImplementIncremental, '应该建议使用增量搜索');
  Assert.assertEquals(result.suggestedAction, 'IMPLEMENT_INCREMENTAL_SEARCH', '应该建议增量搜索');
  
  const stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.quotaExceeded, 1, '配额错误计数应增加');
  Assert.assertTrue(handler.shouldPauseOperations(), '应该暂停操作');
}

/**
 * 测试一般异常处理
 */
function testGeneralExceptionHandling() {
  const handler = createExceptionHandler();
  const error = new Error('Some general error');
  const context = { resourceName: 'test-resource' };
  
  const result = handler.handleGeneralException(error, 'testOperation', context);
  
  Assert.assertTrue(result.handled, '错误应被标记为已处理');
  Assert.assertTrue(result.shouldContinue, '应该继续处理');
  Assert.assertTrue(result.message.includes('testOperation'), '错误信息应包含操作名称');
  Assert.assertNotNull(result.timestamp, '应该有时间戳');
  
  const stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.otherErrors, 1, '其他错误计数应增加');
}

/**
 * 测试错误类型分析
 */
function testErrorTypeAnalysis() {
  const handler = createExceptionHandler();
  
  // 测试权限错误识别
  Assert.assertTrue(handler.isPermissionError(new Error('Permission denied')), '应该识别权限错误');
  Assert.assertTrue(handler.isPermissionError(new Error('Access denied')), '应该识别访问拒绝错误');
  Assert.assertTrue(handler.isPermissionError(new Error('Forbidden')), '应该识别禁止访问错误');
  
  // 测试网络超时错误识别
  Assert.assertTrue(handler.isNetworkTimeoutError(new Error('Connection timeout')), '应该识别连接超时');
  Assert.assertTrue(handler.isNetworkTimeoutError(new Error('Request timed out')), '应该识别请求超时');
  
  // 测试配额错误识别
  Assert.assertTrue(handler.isQuotaExceededError(new Error('Quota exceeded')), '应该识别配额超限');
  Assert.assertTrue(handler.isQuotaExceededError(new Error('Rate limit exceeded')), '应该识别速率限制');
  
  // 测试错误类型分析
  Assert.assertEquals(handler.analyzeErrorType(new Error('Permission denied')), 'PERMISSION_ERROR');
  Assert.assertEquals(handler.analyzeErrorType(new Error('Connection timeout')), 'NETWORK_TIMEOUT');
  Assert.assertEquals(handler.analyzeErrorType(new Error('Quota exceeded')), 'QUOTA_EXCEEDED');
  Assert.assertEquals(handler.analyzeErrorType(new Error('File not found')), 'FILE_NOT_FOUND');
  Assert.assertEquals(handler.analyzeErrorType(new Error('Invalid parameter')), 'INVALID_INPUT');
}

/**
 * 测试用户友好错误信息生成
 */
function testUserFriendlyErrorMessages() {
  const handler = createExceptionHandler();
  
  // 测试权限错误信息
  const permissionMessage = handler.generateUserFriendlyErrorMessage('PERMISSION_ERROR', {
    resourceType: 'file',
    resourceName: 'test.txt'
  });
  Assert.assertTrue(permissionMessage.includes('权限不足'), '应该包含权限不足信息');
  Assert.assertTrue(permissionMessage.includes('test.txt'), '应该包含文件名');
  
  // 测试网络超时错误信息
  const timeoutMessage = handler.generateUserFriendlyErrorMessage('NETWORK_TIMEOUT', {
    operationName: 'searchFiles',
    attempts: 3
  });
  Assert.assertTrue(timeoutMessage.includes('网络连接超时'), '应该包含网络超时信息');
  Assert.assertTrue(timeoutMessage.includes('3'), '应该包含重试次数');
  
  // 测试配额超限错误信息
  const quotaMessage = handler.generateUserFriendlyErrorMessage('QUOTA_EXCEEDED', {});
  Assert.assertTrue(quotaMessage.includes('API配额已达上限'), '应该包含配额信息');
  Assert.assertTrue(quotaMessage.includes('增量搜索'), '应该建议增量搜索');
}

/**
 * 测试错误统计功能
 */
function testErrorStatistics() {
  const handler = createExceptionHandler();
  
  // 初始状态检查
  let stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.permissionErrors, 0, '初始权限错误应为0');
  Assert.assertEquals(stats.networkTimeouts, 0, '初始网络超时应为0');
  Assert.assertEquals(stats.quotaExceeded, 0, '初始配额错误应为0');
  Assert.assertEquals(stats.otherErrors, 0, '初始其他错误应为0');
  
  // 模拟各种错误
  handler.handlePermissionError(new Error('Permission denied'), 'file', 'id1');
  handler.handlePermissionError(new Error('Access denied'), 'folder', 'id2');
  handler.handleQuotaExceededError(new Error('Quota exceeded'), 'operation1');
  handler.handleGeneralException(new Error('General error'), 'operation2');
  
  // 检查统计更新
  stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.permissionErrors, 2, '权限错误应为2');
  Assert.assertEquals(stats.quotaExceeded, 1, '配额错误应为1');
  Assert.assertEquals(stats.otherErrors, 1, '其他错误应为1');
  
  // 测试重置功能
  handler.resetErrorStatistics();
  stats = handler.getErrorStatistics();
  Assert.assertEquals(stats.permissionErrors, 0, '重置后权限错误应为0');
  Assert.assertEquals(stats.quotaExceeded, 0, '重置后配额错误应为0');
}

/**
 * 测试错误处理策略
 */
function testErrorHandlingStrategy() {
  const handler = createExceptionHandler();
  
  // 测试权限错误策略
  const permissionStrategy = handler.getErrorHandlingStrategy(new Error('Permission denied'));
  Assert.assertEquals(permissionStrategy.action, 'SKIP', '权限错误应该跳过');
  Assert.assertTrue(permissionStrategy.shouldContinue, '权限错误应该继续处理');
  Assert.assertFalse(permissionStrategy.shouldRetry, '权限错误不应该重试');
  
  // 测试网络超时策略
  const timeoutStrategy = handler.getErrorHandlingStrategy(new Error('Connection timeout'));
  Assert.assertEquals(timeoutStrategy.action, 'RETRY', '网络超时应该重试');
  Assert.assertTrue(timeoutStrategy.shouldContinue, '网络超时应该继续处理');
  Assert.assertTrue(timeoutStrategy.shouldRetry, '网络超时应该重试');
  
  // 测试配额超限策略
  const quotaStrategy = handler.getErrorHandlingStrategy(new Error('Quota exceeded'));
  Assert.assertEquals(quotaStrategy.action, 'PAUSE_AND_IMPLEMENT_INCREMENTAL', '配额超限应该暂停并实施增量');
  Assert.assertFalse(quotaStrategy.shouldContinue, '配额超限不应该继续');
  Assert.assertFalse(quotaStrategy.shouldRetry, '配额超限不应该重试');
  
  // 测试无效输入策略
  const invalidStrategy = handler.getErrorHandlingStrategy(new Error('Invalid parameter'));
  Assert.assertEquals(invalidStrategy.action, 'STOP', '无效输入应该停止');
  Assert.assertFalse(invalidStrategy.shouldContinue, '无效输入不应该继续');
}

/**
 * 测试重试延迟计算
 */
function testRetryDelayCalculation() {
  const handler = createExceptionHandler();
  
  // 测试指数退避
  const delay1 = handler.calculateRetryDelay(1);
  const delay2 = handler.calculateRetryDelay(2);
  const delay3 = handler.calculateRetryDelay(3);
  
  Assert.assertTrue(delay1 >= 1000, '第一次重试延迟应该至少1秒');
  Assert.assertTrue(delay2 > delay1, '第二次重试延迟应该更长');
  Assert.assertTrue(delay3 > delay2, '第三次重试延迟应该更长');
  
  // 测试最大延迟限制
  const maxDelay = handler.calculateRetryDelay(10);
  Assert.assertTrue(maxDelay <= 30000, '延迟不应该超过30秒');
}

/**
 * 测试统一错误处理入口
 */
function testUnifiedErrorHandling() {
  const handler = createExceptionHandler();
  
  // 测试权限错误
  const permissionResult = handler.handleError(
    new Error('Permission denied'), 
    'testOperation',
    { resourceType: 'file', resourceId: 'test-id', resourceName: 'test.txt' }
  );
  Assert.assertEquals(permissionResult.type, 'PERMISSION_ERROR');
  
  // 测试配额错误
  const quotaResult = handler.handleError(new Error('Quota exceeded'), 'testOperation');
  Assert.assertEquals(quotaResult.type, 'QUOTA_EXCEEDED');
  
  // 测试一般错误
  const generalResult = handler.handleError(new Error('Some error'), 'testOperation');
  Assert.assertTrue(generalResult.handled);
}

/**
 * 测试全局异常处理器
 */
function testGlobalExceptionHandler() {
  const handler1 = getGlobalExceptionHandler();
  const handler2 = getGlobalExceptionHandler();
  
  // 应该返回同一个实例（单例模式）
  Assert.assertTrue(handler1 === handler2, '应该返回同一个全局实例');
  Assert.assertNotNull(handler1, '全局处理器不应为null');
}

/**
 * 运行ExceptionHandler的属性测试
 */
function runExceptionHandlerPropertyTests() {
  console.log('\n=== ExceptionHandler属性测试 ===');
  
  // **Feature: google-drive-search-tool, Property 6: 异常处理稳定性**
  // **验证: 需求 3.1, 3.3**
  PropertyTestGenerator.runPropertyTest(
    '属性 6: 异常处理稳定性',
    function() {
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
      
      const context = {
        resourceType: randomResourceType,
        resourceId: PropertyTestGenerator.randomValidFolderId(),
        resourceName: PropertyTestGenerator.randomString(5, 20) + (randomResourceType === 'file' ? '.txt' : '')
      };
      
      // 对于任何权限受限或无法访问的文件，系统应该跳过该文件并继续处理其他文件而不中断整个搜索过程
      let result;
      
      if (randomErrorType.type === 'permission') {
        // 测试权限错误处理 (需求 3.1)
        result = handler.handlePermissionError(error, context.resourceType, context.resourceId, context.resourceName);
        
        // 验证权限错误处理的稳定性
        Assert.assertEquals(result.type, 'PERMISSION_ERROR', '权限错误类型应该正确识别');
        Assert.assertTrue(result.handled, '权限错误应该被标记为已处理');
        Assert.assertTrue(result.shouldContinue, '权限错误应该允许继续处理其他文件');
        Assert.assertNotNull(result.message, '应该提供错误信息');
        Assert.assertTrue(result.message.includes(context.resourceName || context.resourceId), '错误信息应该包含资源标识');
        
      } else if (randomErrorType.type === 'quota') {
        // 测试配额错误处理
        result = handler.handleQuotaExceededError(error, randomOperationName);
        
        // 验证配额错误处理的稳定性
        Assert.assertEquals(result.type, 'QUOTA_EXCEEDED', '配额错误类型应该正确识别');
        Assert.assertTrue(result.handled, '配额错误应该被标记为已处理');
        Assert.assertTrue(result.shouldPause, '配额错误应该建议暂停操作');
        Assert.assertNotNull(result.message, '应该提供错误信息');
        
      } else {
        // 测试一般异常处理 (需求 3.3)
        result = handler.handleGeneralException(error, randomOperationName, context);
        
        // 验证一般异常处理的稳定性
        Assert.assertTrue(result.handled, '一般异常应该被标记为已处理');
        Assert.assertTrue(result.shouldContinue, '一般异常应该允许继续处理');
        Assert.assertNotNull(result.message, '应该提供错误信息');
        Assert.assertTrue(result.message.includes(randomOperationName), '错误信息应该包含操作名称');
      }
      
      // 验证通用的异常处理稳定性属性
      Assert.assertNotNull(result, '异常处理结果不应为null');
      Assert.assertTrue(result.handled, '所有异常都应该被标记为已处理');
      Assert.assertNotNull(result.timestamp, '应该记录异常发生时间');
      Assert.assertNotNull(result.originalError, '应该保留原始错误信息');
      
      // 验证错误统计功能正常工作
      const stats = handler.getErrorStatistics();
      Assert.assertNotNull(stats, '错误统计信息应该存在');
      Assert.assertTrue(typeof stats.permissionErrors === 'number', '权限错误计数应该是数字');
      Assert.assertTrue(typeof stats.quotaExceeded === 'number', '配额错误计数应该是数字');
      Assert.assertTrue(typeof stats.otherErrors === 'number', '其他错误计数应该是数字');
      
      // 验证系统在处理异常后仍然可以继续工作
      const testError = new Error('Test error for stability check');
      const stabilityResult = handler.handleGeneralException(testError, 'stabilityTest');
      Assert.assertTrue(stabilityResult.handled, '处理异常后系统应该仍然稳定工作');
      
      // 验证异常处理不会影响后续操作
      const secondStats = handler.getErrorStatistics();
      Assert.assertTrue(secondStats.otherErrors >= stats.otherErrors, '错误统计应该正确更新');
      
    },
    100 // 运行100次迭代以确保稳定性
  );
}