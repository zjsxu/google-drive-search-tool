/**
 * 检查点 9: 最终测试执行脚本
 * 运行所有测试并提供详细状态报告
 */

/**
 * 主要的检查点 9 执行函数
 */
function executeCheckpoint9() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         检查点 9: 确保所有测试通过                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = new Date();
  
  // 第一步：验证所有测试函数存在
  console.log('第一步：验证测试函数存在性...\n');
  const verification = verifyAllTestFunctions();
  
  if (verification.missing > 0) {
    console.log(`\n⚠️  发现 ${verification.missing} 个缺失的测试函数`);
    console.log('建议先修复缺失的测试函数后再继续');
    return {
      success: false,
      reason: 'missing_test_functions',
      missing: verification.missingList
    };
  }
  
  // 第二步：运行快速健康检查
  console.log('\n第二步：运行快速健康检查...\n');
  const healthCheck = runQuickHealthCheck();
  
  if (healthCheck.failed > 0) {
    console.log(`\n⚠️  核心功能检查失败 ${healthCheck.failed}/${healthCheck.total}`);
    console.log('建议先修复核心功能问题后再运行完整测试套件');
    return {
      success: false,
      reason: 'core_functionality_failed',
      healthCheck: healthCheck
    };
  }
  
  // 第三步：运行所有测试
  console.log('\n第三步：运行完整测试套件...\n');
  const testResults = runCompleteTestSuite();
  
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  // 生成最终报告
  generateFinalReport(testResults, duration);
  
  return {
    success: testResults.failed === 0,
    results: testResults,
    duration: duration
  };
}

/**
 * 运行完整的测试套件
 */
function runCompleteTestSuite() {
  const testResults = {
    totalSuites: 0,
    passedSuites: 0,
    failedSuites: 0,
    details: [],
    propertyTestResults: []
  };
  
  // 定义所有测试套件
  const testSuites = [
    // 基础单元测试
    { name: '数据模型测试', fn: 'runDataModelsTests', type: 'unit' },
    { name: '搜索控制器单元测试', fn: 'runSearchControllerTests', type: 'unit' },
    { name: 'ContentMatcher单元测试', fn: 'runContentMatcherTests', type: 'unit' },
    { name: 'FolderTraverser单元测试', fn: 'runFolderTraverserTests', type: 'unit' },
    { name: 'ExceptionHandler基础测试', fn: 'runExceptionHandlerBasicTest', type: 'unit' },
    { name: 'ResultCollector测试', fn: 'runResultCollectorTests', type: 'unit' },
    { name: 'PerformanceMonitor测试', fn: 'runPerformanceMonitorTests', type: 'unit' },
    { name: 'IncrementalSearch测试', fn: 'runIncrementalSearchTests', type: 'unit' },
    
    // 属性测试
    { name: '输入验证属性测试 (Property 11)', fn: 'runInputValidationPropertyTest', type: 'property', property: 11 },
    { name: 'ContentMatcher属性测试', fn: 'runContentMatcherPropertyTests', type: 'property' },
    { name: 'FolderTraverser属性测试', fn: 'runFolderTraverserPropertyTests', type: 'property' },
    { name: '文件类型支持属性测试 (Property 2)', fn: 'runTask3_3_FileTypeSupportPropertyTest', type: 'property', property: 2 },
    { name: '搜索准确性属性测试 (Property 3)', fn: 'runTask3_4_SearchAccuracyPropertyTest', type: 'property', property: 3 },
    { name: '搜索范围限制属性测试 (Property 10)', fn: 'runTask3_5_SearchScopeLimitationPropertyTest', type: 'property', property: 10 },
    { name: '递归遍历完整性属性测试 (Property 5)', fn: 'runRecursiveTraversalCompletenessPropertyTest', type: 'property', property: 5 },
    { name: 'ExceptionHandler属性测试', fn: 'runExceptionHandlerPropertyTests', type: 'property' },
    { name: '异常处理稳定性属性测试 (Property 6)', fn: 'runTask5_2_ExceptionHandlingStabilityPropertyTest', type: 'property', property: 6 },
    { name: '错误信息有效性属性测试 (Property 7)', fn: 'runTask5_3_ErrorMessageValidityPropertyTest', type: 'property', property: 7 },
    { name: '结果完整性属性测试 (Property 4)', fn: 'runResultCompletenessPropertyTest', type: 'property', property: 4 },
    { name: '增量搜索策略属性测试 (Property 8)', fn: 'runTask7_2_IncrementalSearchPropertyTest', type: 'property', property: 8 },
    
    // 集成测试
    { name: 'Task 6 集成测试', fn: 'runTask6IntegrationTests', type: 'integration' },
    { name: 'Task 8 集成测试', fn: 'runTask8IntegrationTests', type: 'integration' }
  ];
  
  // 运行每个测试套件
  testSuites.forEach((suite, index) => {
    testResults.totalSuites++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${index + 1}/${testSuites.length}] 运行: ${suite.name}`);
    console.log('='.repeat(60));
    
    try {
      const func = eval(suite.fn);
      if (typeof func === 'function') {
        func();
        testResults.passedSuites++;
        testResults.details.push({
          name: suite.name,
          type: suite.type,
          property: suite.property,
          status: '✓ 通过',
          error: null
        });
        console.log(`\n✓ ${suite.name} - 通过`);
        
        // 记录属性测试结果
        if (suite.type === 'property' && suite.property) {
          testResults.propertyTestResults.push({
            property: suite.property,
            name: suite.name,
            status: 'passed'
          });
        }
      } else {
        throw new Error(`${suite.fn} 不是一个函数`);
      }
    } catch (error) {
      testResults.failedSuites++;
      testResults.details.push({
        name: suite.name,
        type: suite.type,
        property: suite.property,
        status: '✗ 失败',
        error: error.message
      });
      console.log(`\n✗ ${suite.name} - 失败`);
      console.log(`   错误: ${error.message}`);
      
      // 记录属性测试失败
      if (suite.type === 'property' && suite.property) {
        testResults.propertyTestResults.push({
          property: suite.property,
          name: suite.name,
          status: 'failed',
          error: error.message
        });
      }
    }
  });
  
  return testResults;
}

/**
 * 生成最终报告
 */
function generateFinalReport(results, duration) {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                   检查点 9 最终报告                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`执行时间: ${duration.toFixed(2)} 秒`);
  console.log(`总测试套件数: ${results.totalSuites}`);
  console.log(`通过: ${results.passedSuites}`);
  console.log(`失败: ${results.failedSuites}`);
  console.log(`成功率: ${((results.passedSuites / results.totalSuites) * 100).toFixed(2)}%\n`);
  
  // 按类型分组显示结果
  const unitTests = results.details.filter(d => d.type === 'unit');
  const propertyTests = results.details.filter(d => d.type === 'property');
  const integrationTests = results.details.filter(d => d.type === 'integration');
  
  console.log('单元测试结果:');
  console.log('-'.repeat(40));
  unitTests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.status} ${test.name}`);
    if (test.error) {
      console.log(`   错误: ${test.error}`);
    }
  });
  
  console.log('\n属性测试结果:');
  console.log('-'.repeat(40));
  propertyTests.forEach((test, index) => {
    const propertyInfo = test.property ? ` (Property ${test.property})` : '';
    console.log(`${index + 1}. ${test.status} ${test.name}${propertyInfo}`);
    if (test.error) {
      console.log(`   错误: ${test.error}`);
    }
  });
  
  console.log('\n集成测试结果:');
  console.log('-'.repeat(40));
  integrationTests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.status} ${test.name}`);
    if (test.error) {
      console.log(`   错误: ${test.error}`);
    }
  });
  
  // 属性测试摘要
  if (results.propertyTestResults.length > 0) {
    console.log('\n正确性属性验证摘要:');
    console.log('-'.repeat(40));
    const passedProperties = results.propertyTestResults.filter(p => p.status === 'passed');
    const failedProperties = results.propertyTestResults.filter(p => p.status === 'failed');
    
    console.log(`已验证属性: ${passedProperties.length}/${results.propertyTestResults.length}`);
    
    if (failedProperties.length > 0) {
      console.log('\n失败的属性:');
      failedProperties.forEach(prop => {
        console.log(`- Property ${prop.property}: ${prop.name}`);
        console.log(`  错误: ${prop.error}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failedSuites === 0) {
    console.log('🎉 检查点 9 完成：所有测试通过！');
    console.log('✅ 可以继续执行下一个任务');
  } else {
    console.log(`⚠️  检查点 9 未完成：有 ${results.failedSuites} 个测试失败`);
    console.log('❌ 需要修复失败的测试后才能继续');
  }
}

/**
 * 快速执行检查点 9（仅运行关键测试）
 */
function quickCheckpoint9() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         检查点 9: 快速验证                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // 运行快速健康检查
  const healthCheck = runQuickHealthCheck();
  
  // 运行关键属性测试
  const criticalPropertyTests = [
    'runInputValidationPropertyTest',
    'runTask3_4_SearchAccuracyPropertyTest',
    'runRecursiveTraversalCompletenessPropertyTest'
  ];
  
  let propertyTestsPassed = 0;
  let propertyTestsFailed = 0;
  
  console.log('\n运行关键属性测试:');
  console.log('-'.repeat(40));
  
  criticalPropertyTests.forEach(testName => {
    try {
      const func = eval(testName);
      if (typeof func === 'function') {
        func();
        propertyTestsPassed++;
        console.log(`✓ ${testName}`);
      }
    } catch (error) {
      propertyTestsFailed++;
      console.log(`✗ ${testName}: ${error.message}`);
    }
  });
  
  console.log('\n快速检查点 9 结果:');
  console.log(`核心功能: ${healthCheck.passed}/${healthCheck.total} 通过`);
  console.log(`关键属性测试: ${propertyTestsPassed}/${criticalPropertyTests.length} 通过`);
  
  const allPassed = healthCheck.failed === 0 && propertyTestsFailed === 0;
  
  if (allPassed) {
    console.log('✅ 快速检查通过，建议运行完整测试套件确认');
  } else {
    console.log('❌ 快速检查发现问题，需要修复后再运行完整测试');
  }
  
  return allPassed;
}