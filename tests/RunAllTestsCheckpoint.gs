/**
 * 检查点 9: 运行所有测试并报告状态
 * 这个脚本运行所有测试并提供详细的状态报告
 */

/**
 * 主测试检查点函数
 * 运行所有测试并生成详细报告
 */
function runCheckpoint9_AllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         检查点 9: 运行所有测试                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const testResults = {
    totalSuites: 0,
    passedSuites: 0,
    failedSuites: 0,
    details: []
  };
  
  // 定义所有测试套件
  const testSuites = [
    { name: '数据模型测试', fn: runDataModelTests },
    { name: '搜索控制器单元测试', fn: runSearchControllerTests },
    { name: 'ContentMatcher单元测试', fn: runContentMatcherTests },
    { name: 'FolderTraverser单元测试', fn: runFolderTraverserTests },
    { name: '输入验证属性测试 (Property 11)', fn: runInputValidationPropertyTest },
    { name: 'ContentMatcher属性测试', fn: runContentMatcherPropertyTests },
    { name: 'FolderTraverser属性测试', fn: runFolderTraverserPropertyTests },
    { name: '文件类型支持属性测试 (Property 2)', fn: runTask3_3_FileTypeSupportPropertyTest },
    { name: '搜索准确性属性测试 (Property 3)', fn: runTask3_4_SearchAccuracyPropertyTest },
    { name: '搜索范围限制属性测试 (Property 10)', fn: runTask3_5_SearchScopeLimitationPropertyTest },
    { name: '递归遍历完整性属性测试 (Property 5)', fn: runRecursiveTraversalCompletenessPropertyTest },
    { name: 'ExceptionHandler基础测试', fn: runExceptionHandlerBasicTest },
    { name: 'ExceptionHandler属性测试', fn: runExceptionHandlerPropertyTests },
    { name: '异常处理稳定性属性测试 (Property 6)', fn: runTask5_2_ExceptionHandlingStabilityPropertyTest },
    { name: '错误信息有效性属性测试 (Property 7)', fn: runTask5_3_ErrorMessageValidityPropertyTest },
    { name: 'ResultCollector单元测试', fn: runResultCollectorTests },
    { name: '结果完整性属性测试 (Property 4)', fn: runResultCompletenessPropertyTest },
    { name: 'PerformanceMonitor单元测试', fn: runPerformanceMonitorTests },
    { name: 'IncrementalSearch单元测试', fn: runIncrementalSearchTests },
    { name: 'Task 7.2 增量搜索属性测试 (Property 8)', fn: runTask7_2_IncrementalSearchPropertyTest },
    { name: 'Task 6 集成测试', fn: runTask6IntegrationTests },
    { name: 'Task 8 集成测试', fn: runTask8IntegrationTests }
  ];
  
  // 运行每个测试套件
  testSuites.forEach(suite => {
    testResults.totalSuites++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`运行: ${suite.name}`);
    console.log('='.repeat(60));
    
    try {
      suite.fn();
      testResults.passedSuites++;
      testResults.details.push({
        name: suite.name,
        status: '✓ 通过',
        error: null
      });
      console.log(`\n✓ ${suite.name} - 通过`);
    } catch (error) {
      testResults.failedSuites++;
      testResults.details.push({
        name: suite.name,
        status: '✗ 失败',
        error: error.message
      });
      console.log(`\n✗ ${suite.name} - 失败`);
      console.log(`   错误: ${error.message}`);
      if (error.stack) {
        console.log(`   堆栈: ${error.stack}`);
      }
    }
  });
  
  // 打印最终报告
  printFinalReport(testResults);
  
  return testResults;
}

/**
 * 打印最终测试报告
 */
function printFinalReport(results) {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                   最终测试报告                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`总测试套件数: ${results.totalSuites}`);
  console.log(`通过: ${results.passedSuites}`);
  console.log(`失败: ${results.failedSuites}`);
  console.log(`成功率: ${((results.passedSuites / results.totalSuites) * 100).toFixed(2)}%\n`);
  
  console.log('详细结果:');
  console.log('-'.repeat(60));
  results.details.forEach((detail, index) => {
    console.log(`${index + 1}. ${detail.status} ${detail.name}`);
    if (detail.error) {
      console.log(`   错误: ${detail.error}`);
    }
  });
  console.log('-'.repeat(60));
  
  if (results.failedSuites === 0) {
    console.log('\n🎉 所有测试通过！可以继续下一个任务。');
  } else {
    console.log(`\n⚠️  有 ${results.failedSuites} 个测试套件失败，需要修复。`);
  }
}

/**
 * 快速健康检查 - 运行关键测试
 */
function runQuickHealthCheck() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              快速健康检查                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const criticalTests = [
    { name: '搜索控制器基础功能', fn: testSearchControllerBasics },
    { name: 'ContentMatcher基础功能', fn: testContentMatcherBasics },
    { name: 'FolderTraverser基础功能', fn: testFolderTraverserBasics },
    { name: 'ExceptionHandler基础功能', fn: testExceptionHandlerBasics },
    { name: 'ResultCollector基础功能', fn: testResultCollectorBasics }
  ];
  
  let passed = 0;
  let failed = 0;
  
  criticalTests.forEach(test => {
    try {
      test.fn();
      passed++;
      console.log(`✓ ${test.name}`);
    } catch (error) {
      failed++;
      console.log(`✗ ${test.name}: ${error.message}`);
    }
  });
  
  console.log(`\n快速检查结果: ${passed}/${criticalTests.length} 通过`);
  
  if (failed === 0) {
    console.log('✓ 核心功能正常，可以运行完整测试套件');
  } else {
    console.log('⚠️  核心功能存在问题，建议先修复基础功能');
  }
}

/**
 * 测试基础功能
 */
function testSearchControllerBasics() {
  const controller = createSearchController();
  Assert.assertNotNull(controller, 'SearchController应该被创建');
  Assert.assertTrue(controller.validateInputs('test-id', 'keyword'), '有效输入应该通过验证');
  Assert.assertFalse(controller.validateInputs('', 'keyword'), '空文件夹ID应该验证失败');
}

function testContentMatcherBasics() {
  const matcher = createContentMatcher();
  Assert.assertNotNull(matcher, 'ContentMatcher应该被创建');
  const types = matcher.getSupportedMimeTypes();
  Assert.assertTrue(types.length > 0, '应该支持至少一种文件类型');
}

function testFolderTraverserBasics() {
  const traverser = createFolderTraverser();
  Assert.assertNotNull(traverser, 'FolderTraverser应该被创建');
}

function testExceptionHandlerBasics() {
  const handler = createExceptionHandler();
  Assert.assertNotNull(handler, 'ExceptionHandler应该被创建');
}

function testResultCollectorBasics() {
  const collector = createResultCollector();
  Assert.assertNotNull(collector, 'ResultCollector应该被创建');
}
