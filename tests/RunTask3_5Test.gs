/**
 * 任务 3.5 测试运行器
 * 专门运行搜索范围限制属性测试
 */

/**
 * 运行任务 3.5: 搜索范围限制属性测试
 */
function runTask3_5Test() {
  console.log('=== 运行任务 3.5: 搜索范围限制属性测试 ===\n');
  
  try {
    // 运行搜索范围限制属性测试
    runTask3_5_SearchScopeLimitationPropertyTest();
    
    console.log('\n✓ 任务 3.5 搜索范围限制属性测试执行成功');
    
  } catch (error) {
    console.log(`\n✗ 任务 3.5 搜索范围限制属性测试失败: ${error.message}`);
    console.log(error.stack);
    throw error;
  }
}

/**
 * 快速测试入口
 */
function quickTestTask3_5() {
  runTask3_5Test();
}