/**
 * 检查点 9: 测试验证脚本
 * 验证所有测试函数是否存在并可以运行
 */

/**
 * 验证所有测试函数的存在性
 */
function verifyAllTestFunctions() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              检查点 9: 测试函数验证                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const testFunctions = [
    // 基础单元测试
    { name: 'runDataModelsTests', description: '数据模型测试' },
    { name: 'runSearchControllerTests', description: '搜索控制器单元测试' },
    { name: 'runContentMatcherTests', description: 'ContentMatcher单元测试' },
    { name: 'runFolderTraverserTests', description: 'FolderTraverser单元测试' },
    { name: 'runExceptionHandlerBasicTest', description: 'ExceptionHandler基础测试' },
    { name: 'runResultCollectorTests', description: 'ResultCollector测试' },
    { name: 'runPerformanceMonitorTests', description: 'PerformanceMonitor测试' },
    { name: 'runIncrementalSearchManagerTests', description: 'IncrementalSearch测试' },
    
    // 属性测试
    { name: 'runInputValidationPropertyTest', description: '输入验证属性测试 (Property 11)' },
    { name: 'runContentMatcherPropertyTests', description: 'ContentMatcher属性测试' },
    { name: 'runFolderTraverserPropertyTests', description: 'FolderTraverser属性测试' },
    { name: 'runTask3_3_FileTypeSupportPropertyTest', description: '文件类型支持属性测试 (Property 2)' },
    { name: 'runTask3_4_SearchAccuracyPropertyTest', description: '搜索准确性属性测试 (Property 3)' },
    { name: 'runTask3_5_SearchScopeLimitationPropertyTest', description: '搜索范围限制属性测试 (Property 10)' },
    { name: 'runRecursiveTraversalCompletenessPropertyTest', description: '递归遍历完整性属性测试 (Property 5)' },
    { name: 'runExceptionHandlerPropertyTests', description: 'ExceptionHandler属性测试' },
    { name: 'runTask5_2_ExceptionHandlingStabilityPropertyTest', description: '异常处理稳定性属性测试 (Property 6)' },
    { name: 'runTask5_3_ErrorMessageValidityPropertyTest', description: '错误信息有效性属性测试 (Property 7)' },
    { name: 'runResultCompletenessPropertyTest', description: '结果完整性属性测试 (Property 4)' },
    { name: 'runTask7_2IncrementalSearchTest', description: '增量搜索属性测试 (Property 8)' },
    
    // 集成测试
    { name: 'runTask6IntegrationTest', description: 'Task 6 集成测试' },
    { name: 'runTask8IntegrationTests', description: 'Task 8 集成测试' }
  ];
  
  let existingFunctions = 0;
  let missingFunctions = 0;
  const missingList = [];
  
  console.log('检查测试函数存在性:');
  console.log('-'.repeat(60));
  
  testFunctions.forEach((testFunc, index) => {
    try {
      // 检查函数是否存在
      const func = eval(testFunc.name);
      if (typeof func === 'function') {
        existingFunctions++;
        console.log(`${index + 1}. ✓ ${testFunc.name} - ${testFunc.description}`);
      } else {
        missingFunctions++;
        missingList.push(testFunc);
        console.log(`${index + 1}. ✗ ${testFunc.name} - ${testFunc.description} (不是函数)`);
      }
    } catch (error) {
      missingFunctions++;
      missingList.push(testFunc);
      console.log(`${index + 1}. ✗ ${testFunc.name} - ${testFunc.description} (不存在)`);
    }
  });
  
  console.log('-'.repeat(60));
  console.log(`总计: ${testFunctions.length}`);
  console.log(`存在: ${existingFunctions}`);
  console.log(`缺失: ${missingFunctions}`);
  
  if (missingFunctions > 0) {
    console.log('\n缺失的测试函数:');
    missingList.forEach((func, index) => {
      console.log(`${index + 1}. ${func.name} - ${func.description}`);
    });
  }
  
  return {
    total: testFunctions.length,
    existing: existingFunctions,
    missing: missingFunctions,
    missingList: missingList
  };
}

/**
 * 运行快速健康检查
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
  
  return { passed, failed, total: criticalTests.length };
}

/**
 * 测试基础功能
 */
function testSearchControllerBasics() {
  const controller = createSearchController();
  if (!controller) throw new Error('SearchController创建失败');
  if (!controller.validateInputs('test-id', 'keyword')) throw new Error('有效输入验证失败');
  if (controller.validateInputs('', 'keyword')) throw new Error('空文件夹ID验证应该失败');
}

function testContentMatcherBasics() {
  const matcher = createContentMatcher();
  if (!matcher) throw new Error('ContentMatcher创建失败');
  const types = matcher.getSupportedMimeTypes();
  if (!types || types.length === 0) throw new Error('应该支持至少一种文件类型');
}

function testFolderTraverserBasics() {
  const traverser = createFolderTraverser();
  if (!traverser) throw new Error('FolderTraverser创建失败');
}

function testExceptionHandlerBasics() {
  const handler = createExceptionHandler();
  if (!handler) throw new Error('ExceptionHandler创建失败');
}

function testResultCollectorBasics() {
  const collector = createResultCollector();
  if (!collector) throw new Error('ResultCollector创建失败');
}

/**
 * 运行所有可用的测试
 */
function runAvailableTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              运行所有可用测试                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const verification = verifyAllTestFunctions();
  
  if (verification.missing > 0) {
    console.log(`\n⚠️  发现 ${verification.missing} 个缺失的测试函数，将跳过这些测试`);
  }
  
  console.log('\n开始运行可用的测试...\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  // 运行基础单元测试
  const basicTests = [
    'runDataModelsTests',
    'runSearchControllerTests', 
    'runContentMatcherTests',
    'runFolderTraverserTests',
    'runExceptionHandlerBasicTest',
    'runResultCollectorTests',
    'runPerformanceMonitorTests'
  ];
  
  basicTests.forEach(testName => {
    try {
      const func = eval(testName);
      if (typeof func === 'function') {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`运行: ${testName}`);
        console.log('='.repeat(50));
        func();
        totalPassed++;
        console.log(`✓ ${testName} - 通过`);
      }
    } catch (error) {
      totalFailed++;
      console.log(`✗ ${testName} - 失败: ${error.message}`);
    }
  });
  
  // 运行属性测试
  const propertyTests = [
    'runInputValidationPropertyTest',
    'runTask3_3_FileTypeSupportPropertyTest',
    'runTask3_4_SearchAccuracyPropertyTest',
    'runTask3_5_SearchScopeLimitationPropertyTest',
    'runRecursiveTraversalCompletenessPropertyTest',
    'runTask5_2_ExceptionHandlingStabilityPropertyTest',
    'runTask5_3_ErrorMessageValidityPropertyTest'
  ];
  
  propertyTests.forEach(testName => {
    try {
      const func = eval(testName);
      if (typeof func === 'function') {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`运行: ${testName}`);
        console.log('='.repeat(50));
        func();
        totalPassed++;
        console.log(`✓ ${testName} - 通过`);
      }
    } catch (error) {
      totalFailed++;
      console.log(`✗ ${testName} - 失败: ${error.message}`);
    }
  });
  
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                   最终测试报告                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`总测试套件数: ${totalPassed + totalFailed}`);
  console.log(`通过: ${totalPassed}`);
  console.log(`失败: ${totalFailed}`);
  console.log(`成功率: ${totalFailed === 0 ? '100' : ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%\n`);
  
  if (totalFailed === 0) {
    console.log('🎉 所有可用测试通过！');
  } else {
    console.log(`⚠️  有 ${totalFailed} 个测试失败，需要修复。`);
  }
  
  return {
    passed: totalPassed,
    failed: totalFailed,
    total: totalPassed + totalFailed
  };
}