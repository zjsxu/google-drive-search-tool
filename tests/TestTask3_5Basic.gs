/**
 * 任务 3.5 基本功能测试
 * 验证搜索范围限制的基本功能
 */

/**
 * 测试搜索范围限制的基本功能
 */
function testSearchScopeLimitationBasics() {
  console.log('=== 测试搜索范围限制基本功能 ===');
  
  try {
    const matcher = createContentMatcher();
    
    // 测试基本查询构建
    const folderId = 'test-folder-id-123456789';
    const keyword = 'test-keyword';
    const query = matcher.buildSearchQuery(folderId, keyword);
    
    console.log(`构建的查询: ${query}`);
    
    // 验证需求 5.1: 搜索仅限于指定文件夹及其子文件夹
    const hasParents = query.includes(`parents in "${folderId}"`);
    console.log(`包含父文件夹限制 (需求 5.1): ${hasParents}`);
    
    // 验证需求 5.2: 使用Drive API查询语法限定父文件夹范围
    const hasParentsClause = query.includes('parents in');
    console.log(`使用Drive API parents语法 (需求 5.2): ${hasParentsClause}`);
    
    // 验证需求 5.4: 排除回收站中的文件
    const hasTrashed = query.includes('trashed = false');
    console.log(`排除回收站文件 (需求 5.4): ${hasTrashed}`);
    
    // 验证查询有效性
    const isValid = matcher.validateSearchQuery(query);
    console.log(`查询有效性: ${isValid}`);
    
    // 验证查询不包含其他文件夹
    const otherFolderId = 'other-folder-id-987654321';
    const hasOtherFolder = query.includes(`parents in "${otherFolderId}"`);
    console.log(`不包含其他文件夹 (${otherFolderId}): ${!hasOtherFolder}`);
    
    if (hasParents && hasParentsClause && hasTrashed && isValid && !hasOtherFolder) {
      console.log('✓ 搜索范围限制基本功能测试通过');
      return true;
    } else {
      console.log('✗ 搜索范围限制基本功能测试失败');
      return false;
    }
    
  } catch (error) {
    console.log(`✗ 搜索范围限制基本功能测试异常: ${error.message}`);
    return false;
  }
}

/**
 * 运行任务 3.5 的简化测试
 */
function runTask3_5BasicTest() {
  console.log('=== 开始运行任务 3.5: 搜索范围限制基本测试 ===');
  
  try {
    // 运行基本功能测试
    const basicResult = testSearchScopeLimitationBasics();
    
    if (basicResult) {
      console.log('\n✓ 任务 3.5 基本测试执行成功');
      
      // 运行完整的属性测试
      console.log('\n开始运行完整属性测试...');
      runTask3_5_SearchScopeLimitationPropertyTest();
      console.log('\n✓ 任务 3.5 完整属性测试执行成功');
      
      return true;
    } else {
      console.log('\n✗ 任务 3.5 基本测试失败');
      return false;
    }
    
  } catch (error) {
    console.log(`\n✗ 任务 3.5 测试失败: ${error.message}`);
    console.log('错误堆栈:', error.stack);
    return false;
  }
}