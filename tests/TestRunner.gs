/**
 * 测试运行器
 * 运行所有测试套件
 */

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('=== 开始运行所有测试 ===\n');
  
  try {
    // 运行数据模型测试
    runDataModelsTests();
    
    // 运行搜索控制器单元测试
    runSearchControllerTests();
    
    // 运行ContentMatcher单元测试
    runContentMatcherTests();
    
    // 运行FolderTraverser单元测试
    runFolderTraverserTests();
    
    // 运行输入验证属性测试
    runInputValidationPropertyTest();
    
    // 运行ContentMatcher属性测试
    runContentMatcherPropertyTests();
    
    // 运行FolderTraverser属性测试
    runFolderTraverserPropertyTests();
    
    // 运行任务 3.3: 文件类型支持属性测试
    runTask3_3_FileTypeSupportPropertyTest();
    
    // 运行任务 3.4: 搜索准确性属性测试
    runTask3_4_SearchAccuracyPropertyTest();
    
    // 运行任务 3.5: 搜索范围限制属性测试
    runTask3_5_SearchScopeLimitationPropertyTest();
    
    // 运行任务 4.2: 递归遍历完整性属性测试
    runRecursiveTraversalCompletenessPropertyTest();
    
    // 运行ExceptionHandler基础测试
    runExceptionHandlerBasicTest();
    
    // 运行ExceptionHandler属性测试
    runExceptionHandlerPropertyTests();
    
    // 运行任务 5.2: 异常处理稳定性属性测试
    runTask5_2_ExceptionHandlingStabilityPropertyTest();
    
    // 运行任务 5.3: 错误信息有效性属性测试
    runTask5_3_ErrorMessageValidityPropertyTest();
    
    // 运行ResultCollector测试
    runResultCollectorTests();
    
    // 运行PerformanceMonitor测试
    runPerformanceMonitorTests();
    
    // 运行IncrementalSearch测试
    runIncrementalSearchTests();
    
    // 运行任务 7.2: 增量搜索策略属性测试
    runTask7_2_IncrementalSearchPropertyTest();
    
    // 运行Task 6集成测试
    runTask6IntegrationTests();
    
    // 运行Task 8集成测试
    runTask8IntegrationTests();
    
    console.log('\n=== 所有测试完成 ===');
    
  } catch (error) {
    console.log(`\n测试执行失败: ${error.message}`);
    console.log(error.stack);
  }
}

/**
 * 仅运行输入验证属性测试
 */
function runInputValidationTest() {
  console.log('=== 运行输入验证属性测试 ===\n');
  
  try {
    runInputValidationPropertyTest();
    console.log('\n=== 输入验证属性测试完成 ===');
  } catch (error) {
    console.log(`\n输入验证属性测试失败: ${error.message}`);
    console.log(error.stack);
  }
}

/**
 * 运行基本功能测试
 */
function runBasicTests() {
  console.log('=== 运行基本功能测试 ===\n');
  
  try {
    // 测试SearchController基本功能
    const controller = createSearchController();
    console.log('✓ SearchController创建成功');
    
    // 测试有效输入验证
    const validResult = controller.validateInputs('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'test');
    console.log(`✓ 有效输入验证: ${validResult}`);
    
    // 测试无效输入验证
    const invalidResult = controller.validateInputs('', 'test');
    console.log(`✓ 无效输入验证: ${invalidResult}`);
    
    // 测试ContentMatcher基本功能
    const matcher = createContentMatcher();
    console.log('✓ ContentMatcher创建成功');
    
    // 测试支持的文件类型
    const supportedTypes = matcher.getSupportedMimeTypes();
    console.log(`✓ 支持的文件类型数量: ${supportedTypes.length}`);
    
    // 测试查询构建
    const query = matcher.buildSearchQuery('test-folder', 'test');
    console.log(`✓ 查询构建成功: ${query.length > 0}`);
    
    console.log('\n=== 基本功能测试完成 ===');
    
  } catch (error) {
    console.log(`\n基本功能测试失败: ${error.message}`);
    console.log(error.stack);
  }
}

/**
 * 仅运行ContentMatcher测试
 */
function runContentMatcherTestsOnly() {
  console.log('=== 运行ContentMatcher测试 ===\n');
  
  try {
    runContentMatcherTests();
    runContentMatcherPropertyTests();
    runTask3_4_SearchAccuracyPropertyTest();
    console.log('\n=== ContentMatcher测试完成 ===');
  } catch (error) {
    console.log(`\nContentMatcher测试失败: ${error.message}`);
    console.log(error.stack);
  }
}