/**
 * 专门运行任务 3.4 搜索准确性属性测试的脚本
 */

/**
 * 运行任务 3.4 测试
 */
function runTask3_4Test() {
  console.log('=== 开始运行任务 3.4: 搜索准确性属性测试 ===');
  
  try {
    // 运行搜索准确性属性测试
    runTask3_4_SearchAccuracyPropertyTest();
    
    console.log('\n✓ 任务 3.4 搜索准确性属性测试执行成功');
    return true;
    
  } catch (error) {
    console.log(`\n✗ 任务 3.4 搜索准确性属性测试失败: ${error.message}`);
    console.log('错误堆栈:', error.stack);
    return false;
  }
}

/**
 * 测试搜索准确性的基本功能
 */
function testSearchAccuracyBasics() {
  console.log('=== 测试搜索准确性基本功能 ===');
  
  try {
    const matcher = createContentMatcher();
    
    // 测试基本查询构建
    const folderId = 'test-folder-id-123';
    const keyword = 'test-keyword';
    const query = matcher.buildSearchQuery(folderId, keyword);
    
    console.log(`构建的查询: ${query}`);
    
    // 验证查询包含必要组件
    const hasParents = query.includes(`parents in "${folderId}"`);
    const hasFullText = query.includes(`fullText contains "${keyword}"`);
    const hasTrashed = query.includes('trashed = false');
    
    console.log(`包含父文件夹限制: ${hasParents}`);
    console.log(`包含全文搜索: ${hasFullText}`);
    console.log(`排除回收站: ${hasTrashed}`);
    
    if (hasParents && hasFullText && hasTrashed) {
      console.log('✓ 搜索准确性基本功能测试通过');
      return true;
    } else {
      console.log('✗ 搜索准确性基本功能测试失败');
      return false;
    }
    
  } catch (error) {
    console.log(`✗ 搜索准确性基本功能测试异常: ${error.message}`);
    return false;
  }
}