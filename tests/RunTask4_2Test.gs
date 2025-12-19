/**
 * 运行任务 4.2 的属性测试
 * 递归遍历完整性属性测试
 */

/**
 * 仅运行任务 4.2: 递归遍历完整性属性测试
 */
function runTask4_2Test() {
  console.log('=== 运行任务 4.2: 递归遍历完整性属性测试 ===\n');
  
  try {
    // 运行递归遍历完整性属性测试
    runRecursiveTraversalCompletenessPropertyTest();
    
    console.log('\n=== 任务 4.2 测试完成 ===');
    
  } catch (error) {
    console.log(`\n任务 4.2 测试失败: ${error.message}`);
    console.log(error.stack);
    throw error; // 重新抛出错误以便调用者处理
  }
}

/**
 * 测试入口函数
 */
function testTask4_2() {
  runTask4_2Test();
}