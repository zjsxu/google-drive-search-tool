/**
 * ExceptionHandler使用示例
 * 展示如何在搜索流程中集成异常处理
 */

/**
 * 演示ExceptionHandler的基本使用
 */
function demonstrateExceptionHandler() {
  console.log('=== ExceptionHandler使用演示 ===\n');
  
  // 创建异常处理器实例
  const exceptionHandler = createExceptionHandler();
  console.log('1. 创建ExceptionHandler实例');
  
  // 演示1: 处理权限错误
  console.log('\n2. 演示权限错误处理:');
  try {
    // 模拟访问受限文件
    throw new Error('Permission denied: You do not have access to this file');
  } catch (error) {
    const result = exceptionHandler.handlePermissionError(
      error, 
      'file', 
      'restricted-file-id', 
      'confidential-document.pdf'
    );
    console.log(`   错误类型: ${result.type}`);
    console.log(`   是否继续: ${result.shouldContinue}`);
    console.log(`   错误信息: ${result.message}`);
  }
  
  // 演示2: 处理配额超限错误
  console.log('\n3. 演示配额超限错误处理:');
  try {
    throw new Error('Quota exceeded: API usage limit reached');
  } catch (error) {
    const result = exceptionHandler.handleQuotaExceededError(error, 'searchFiles');
    console.log(`   错误类型: ${result.type}`);
    console.log(`   是否暂停: ${result.shouldPause}`);
    console.log(`   建议操作: ${result.suggestedAction}`);
    console.log(`   错误信息: ${result.message}`);
  }
  
  // 演示3: 生成用户友好的错误信息
  console.log('\n4. 演示用户友好错误信息生成:');
  const userMessage = exceptionHandler.generateUserFriendlyErrorMessage('NETWORK_TIMEOUT', {
    operationName: '搜索文件',
    attempts: 3
  });
  console.log(`   ${userMessage}`);
  
  // 演示4: 查看错误统计
  console.log('\n5. 错误统计信息:');
  const stats = exceptionHandler.getErrorStatistics();
  console.log(`   权限错误: ${stats.permissionErrors}`);
  console.log(`   配额错误: ${stats.quotaExceeded}`);
  console.log(`   网络超时: ${stats.networkTimeouts}`);
  console.log(`   其他错误: ${stats.otherErrors}`);
  
  console.log('\n=== 演示完成 ===');
}

/**
 * 演示在搜索流程中集成ExceptionHandler
 */
function demonstrateIntegrationWithSearch() {
  console.log('\n=== 搜索流程中的异常处理集成演示 ===\n');
  
  const exceptionHandler = getGlobalExceptionHandler();
  
  // 模拟搜索流程
  console.log('1. 开始搜索流程...');
  
  // 模拟处理多个文件，其中一些会遇到错误
  const mockFiles = [
    { id: 'file1', name: 'document1.pdf', hasPermission: true },
    { id: 'file2', name: 'restricted.pdf', hasPermission: false },
    { id: 'file3', name: 'report.docx', hasPermission: true },
    { id: 'file4', name: 'confidential.txt', hasPermission: false }
  ];
  
  const successfulFiles = [];
  const failedFiles = [];
  
  mockFiles.forEach(file => {
    try {
      if (!file.hasPermission) {
        throw new Error('Permission denied');
      }
      
      // 模拟成功处理文件
      console.log(`   ✓ 成功处理文件: ${file.name}`);
      successfulFiles.push(file);
      
    } catch (error) {
      // 使用异常处理器处理错误
      const errorInfo = exceptionHandler.handlePermissionError(
        error,
        'file',
        file.id,
        file.name
      );
      
      console.log(`   ✗ ${errorInfo.message}`);
      failedFiles.push({ file, errorInfo });
      
      // 根据错误处理结果决定是否继续
      if (!errorInfo.shouldContinue) {
        console.log('   停止搜索流程');
        return;
      }
    }
  });
  
  // 显示搜索结果摘要
  console.log('\n2. 搜索结果摘要:');
  console.log(`   成功处理: ${successfulFiles.length} 个文件`);
  console.log(`   失败跳过: ${failedFiles.length} 个文件`);
  
  // 显示错误统计
  const stats = exceptionHandler.getErrorStatistics();
  console.log('\n3. 错误统计:');
  console.log(`   权限错误总数: ${stats.permissionErrors}`);
  
  console.log('\n=== 集成演示完成 ===');
}

/**
 * 演示错误处理策略
 */
function demonstrateErrorHandlingStrategies() {
  console.log('\n=== 错误处理策略演示 ===\n');
  
  const exceptionHandler = createExceptionHandler();
  
  // 测试不同类型的错误及其处理策略
  const errorScenarios = [
    { error: new Error('Permission denied'), name: '权限错误' },
    { error: new Error('Connection timeout'), name: '网络超时' },
    { error: new Error('Quota exceeded'), name: '配额超限' },
    { error: new Error('File not found'), name: '文件不存在' },
    { error: new Error('Invalid parameter'), name: '无效参数' }
  ];
  
  errorScenarios.forEach(scenario => {
    const strategy = exceptionHandler.getErrorHandlingStrategy(scenario.error);
    
    console.log(`${scenario.name}:`);
    console.log(`   处理动作: ${strategy.action}`);
    console.log(`   是否继续: ${strategy.shouldContinue}`);
    console.log(`   是否重试: ${strategy.shouldRetry}`);
    console.log(`   用户提示: ${strategy.userMessage}`);
    console.log('');
  });
  
  console.log('=== 策略演示完成 ===');
}

/**
 * 运行所有演示
 */
function runAllExceptionHandlerDemos() {
  demonstrateExceptionHandler();
  demonstrateIntegrationWithSearch();
  demonstrateErrorHandlingStrategies();
}