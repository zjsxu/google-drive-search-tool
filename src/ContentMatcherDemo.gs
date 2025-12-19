/**
 * ContentMatcher演示脚本
 * 展示ContentMatcher的核心功能
 */

/**
 * 演示ContentMatcher基本功能
 */
function demoContentMatcher() {
  console.log('=== ContentMatcher功能演示 ===\n');
  
  try {
    // 创建ContentMatcher实例
    const matcher = createContentMatcher();
    console.log('✓ ContentMatcher实例创建成功');
    
    // 展示支持的文件类型
    console.log('\n支持的文件类型:');
    const supportedTypes = matcher.getSupportedMimeTypes();
    supportedTypes.forEach(type => {
      console.log(`- ${matcher.getFileTypeName(type)} (${type})`);
    });
    
    // 演示查询构建
    console.log('\n查询构建演示:');
    const folderId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
    const keyword = '项目报告';
    const query = matcher.buildSearchQuery(folderId, keyword);
    console.log(`文件夹ID: ${folderId}`);
    console.log(`搜索关键词: ${keyword}`);
    console.log(`生成的查询: ${query}`);
    
    // 验证查询有效性
    const isValid = matcher.validateSearchQuery(query);
    console.log(`查询有效性: ${isValid ? '✓ 有效' : '✗ 无效'}`);
    
    // 演示文件类型检测
    console.log('\n文件类型检测演示:');
    const testFiles = [
      { name: 'report.pdf', mimeType: 'application/pdf' },
      { name: 'document.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'notes.txt', mimeType: 'text/plain' },
      { name: 'image.jpg', mimeType: 'image/jpeg' }
    ];
    
    testFiles.forEach(file => {
      const isSupported = matcher.isMimeTypeSupported(file.mimeType);
      const typeName = matcher.getFileTypeName(file.mimeType);
      const canSearch = matcher.canSearchFileContent(file.mimeType);
      const needsSpecialHandling = matcher.requiresSpecialHandling(file.mimeType);
      
      console.log(`文件: ${file.name}`);
      console.log(`  类型: ${typeName}`);
      console.log(`  支持: ${isSupported ? '✓' : '✗'}`);
      console.log(`  可搜索: ${canSearch ? '✓' : '✗'}`);
      console.log(`  需特殊处理: ${needsSpecialHandling ? '✓' : '✗'}`);
      console.log('');
    });
    
    // 演示关键词转义
    console.log('关键词转义演示:');
    const specialKeywords = [
      'normal keyword',
      'keyword with "quotes"',
      "keyword with 'single quotes'",
      'keyword with \\ backslash'
    ];
    
    specialKeywords.forEach(kw => {
      const escaped = matcher.escapeSearchKeyword(kw);
      console.log(`原始: ${kw}`);
      console.log(`转义: ${escaped}`);
      console.log('');
    });
    
    console.log('=== ContentMatcher演示完成 ===');
    
  } catch (error) {
    console.log(`演示过程中发生错误: ${error.message}`);
    console.log(error.stack);
  }
}

/**
 * 演示多文件类型搜索功能
 * 注意：此函数需要有效的Google Drive文件夹ID才能正常工作
 */
function demoMultiFileTypeSearch() {
  console.log('=== 多文件类型搜索演示 ===\n');
  
  try {
    const matcher = createContentMatcher();
    
    // 使用示例文件夹ID（实际使用时需要替换为真实的文件夹ID）
    const folderId = '请替换为真实的文件夹ID';
    const keyword = '测试';
    
    console.log(`搜索文件夹: ${folderId}`);
    console.log(`搜索关键词: ${keyword}`);
    console.log('');
    
    // 执行多文件类型搜索
    const results = matcher.searchMultipleFileTypes(folderId, keyword);
    
    console.log('搜索结果统计:');
    console.log(`Google Docs: ${results.googleDocs.length} 个文件`);
    console.log(`PDF: ${results.pdf.length} 个文件`);
    console.log(`Word文档: ${results.word.length} 个文件`);
    console.log(`文本文件: ${results.text.length} 个文件`);
    console.log(`Google Sheets: ${results.googleSheets.length} 个文件`);
    console.log(`总计: ${results.total} 个文件`);
    
    // 显示按类型分组的结果
    console.log('\n按类型分组的结果:');
    Object.keys(results.byType).forEach(typeName => {
      const files = results.byType[typeName];
      console.log(`${typeName}: ${files.length} 个文件`);
      files.forEach((file, index) => {
        if (index < 3) { // 只显示前3个文件
          console.log(`  - ${file.getName()}`);
        } else if (index === 3) {
          console.log(`  - ... 还有 ${files.length - 3} 个文件`);
        }
      });
    });
    
  } catch (error) {
    console.log(`多文件类型搜索演示失败: ${error.message}`);
    
    // 如果是因为文件夹ID无效，提供帮助信息
    if (error.message.includes('文件夹') || error.message.includes('folder')) {
      console.log('\n提示: 请将 folderId 变量替换为有效的Google Drive文件夹ID');
      console.log('可以通过以下方式获取文件夹ID:');
      console.log('1. 在Google Drive中打开目标文件夹');
      console.log('2. 从浏览器地址栏复制文件夹ID（/folders/ 后面的部分）');
    }
  }
}

/**
 * 测试ContentMatcher的错误处理能力
 */
function testContentMatcherErrorHandling() {
  console.log('=== ContentMatcher错误处理测试 ===\n');
  
  try {
    const matcher = createContentMatcher();
    
    // 测试无效输入的处理
    console.log('测试无效输入处理:');
    
    // 测试空文件夹ID
    const emptyFolderResult = matcher.searchFilesInFolder('', 'test');
    console.log(`空文件夹ID搜索结果: ${emptyFolderResult.length} 个文件`);
    
    // 测试无效文件夹ID
    const invalidFolderResult = matcher.searchFilesInFolder('invalid-folder-id', 'test');
    console.log(`无效文件夹ID搜索结果: ${invalidFolderResult.length} 个文件`);
    
    // 测试特殊字符关键词
    const specialCharQuery = matcher.buildSearchQuery('test-folder', 'test "special" keyword');
    console.log(`特殊字符查询构建: ${matcher.validateSearchQuery(specialCharQuery) ? '成功' : '失败'}`);
    
    // 测试查询验证
    console.log('\n查询验证测试:');
    const testQueries = [
      '',
      null,
      'incomplete query',
      'parents in "folder" and fullText contains "keyword" and trashed = false'
    ];
    
    testQueries.forEach((query, index) => {
      const isValid = matcher.validateSearchQuery(query);
      console.log(`查询 ${index + 1}: ${isValid ? '✓ 有效' : '✗ 无效'}`);
    });
    
    console.log('\n=== 错误处理测试完成 ===');
    
  } catch (error) {
    console.log(`错误处理测试失败: ${error.message}`);
  }
}