/**
 * 属性测试 4: 结果完整性
 * **Feature: google-drive-search-tool, Property 4: 结果完整性**
 * **验证: 需求 1.4, 1.5, 2.4**
 * 
 * 属性描述：
 * 对于任何匹配的文件，搜索结果应该包含文件名、访问链接和完整的父级路径信息
 */

/**
 * 运行结果完整性属性测试
 * 验证所有搜索结果都包含必需的完整信息
 */
function runResultCompletenessPropertyTest() {
  console.log('\n=== 属性测试 4: 结果完整性 ===');
  console.log('**Feature: google-drive-search-tool, Property 4: 结果完整性**');
  console.log('**验证: 需求 1.4, 1.5, 2.4**\n');
  
  PropertyTestGenerator.runPropertyTest(
    '结果完整性属性',
    testResultCompletenessProperty,
    100
  );
  
  console.log('✓ 属性测试 4 完成\n');
}

/**
 * 属性测试函数：验证结果完整性
 * 对于任何匹配的文件，搜索结果应该包含文件名、访问链接和完整的父级路径信息
 */
function testResultCompletenessProperty() {
  // 创建ResultCollector实例
  const collector = createResultCollector();
  
  // 生成随机测试数据
  const mockFile = createMockFile();
  const folderPath = generateRandomFolderPath();
  
  // 收集结果
  const result = collector.collectResult(mockFile, folderPath);
  
  // 验证结果不为null
  Assert.assertNotNull(result, '收集的结果不应为null');
  
  // 属性验证：结果必须包含文件名
  Assert.assertNotNull(result.fileName, '结果必须包含文件名');
  Assert.assertTrue(
    typeof result.fileName === 'string' && result.fileName.length > 0,
    '文件名必须是非空字符串'
  );
  
  // 属性验证：结果必须包含访问链接
  Assert.assertNotNull(result.fileUrl, '结果必须包含访问链接');
  Assert.assertTrue(
    typeof result.fileUrl === 'string' && result.fileUrl.length > 0,
    '访问链接必须是非空字符串'
  );
  Assert.assertTrue(
    result.fileUrl.startsWith('http://') || result.fileUrl.startsWith('https://'),
    '访问链接必须是有效的URL'
  );
  
  // 属性验证：结果必须包含完整的父级路径信息
  Assert.assertNotNull(result.folderPath, '结果必须包含父级路径');
  Assert.assertTrue(
    typeof result.folderPath === 'string',
    '父级路径必须是字符串'
  );
  Assert.assertEquals(
    result.folderPath,
    folderPath,
    '结果中的路径必须与提供的路径完全一致'
  );
  
  // 额外验证：结果应该包含文件类型信息
  Assert.assertNotNull(result.fileType, '结果应该包含文件类型');
  Assert.assertTrue(
    typeof result.fileType === 'string' && result.fileType.length > 0,
    '文件类型必须是非空字符串'
  );
  
  // 额外验证：结果应该包含最后修改时间
  Assert.assertNotNull(result.lastModified, '结果应该包含最后修改时间');
  Assert.assertTrue(
    result.lastModified instanceof Date,
    '最后修改时间必须是Date对象'
  );
}

/**
 * 测试批量收集结果的完整性
 */
function testBatchResultCompletenessProperty() {
  console.log('\n=== 测试批量结果完整性 ===');
  
  const collector = createResultCollector();
  
  // 生成多个模拟文件匹配
  const fileMatches = [];
  const numFiles = Math.floor(Math.random() * 10) + 5; // 5-14个文件
  
  for (let i = 0; i < numFiles; i++) {
    fileMatches.push({
      file: createMockFile(),
      parentPath: generateRandomFolderPath()
    });
  }
  
  // 批量收集结果
  const results = collector.collectResults(fileMatches);
  
  // 验证结果数量
  Assert.assertEquals(
    results.length,
    numFiles,
    '收集的结果数量应该等于输入的文件数量'
  );
  
  // 验证每个结果的完整性
  results.forEach((result, index) => {
    Assert.assertNotNull(result, `结果 ${index + 1} 不应为null`);
    Assert.assertNotNull(result.fileName, `结果 ${index + 1} 必须包含文件名`);
    Assert.assertNotNull(result.fileUrl, `结果 ${index + 1} 必须包含访问链接`);
    Assert.assertNotNull(result.folderPath, `结果 ${index + 1} 必须包含父级路径`);
    Assert.assertNotNull(result.fileType, `结果 ${index + 1} 必须包含文件类型`);
    Assert.assertNotNull(result.lastModified, `结果 ${index + 1} 必须包含最后修改时间`);
  });
  
  console.log(`✓ 批量收集 ${numFiles} 个结果，所有结果都包含完整信息`);
}

/**
 * 测试格式化输出的完整性
 */
function testFormattedOutputCompletenessProperty() {
  console.log('\n=== 测试格式化输出完整性 ===');
  
  const collector = createResultCollector();
  
  // 添加一些测试结果
  const numResults = Math.floor(Math.random() * 5) + 3; // 3-7个结果
  for (let i = 0; i < numResults; i++) {
    collector.collectResult(createMockFile(), generateRandomFolderPath());
  }
  
  // 格式化结果
  const formattedOutput = collector.formatResults();
  
  // 验证格式化输出的结构完整性
  Assert.assertNotNull(formattedOutput, '格式化输出不应为null');
  Assert.assertNotNull(formattedOutput.summary, '格式化输出必须包含摘要信息');
  Assert.assertNotNull(formattedOutput.results, '格式化输出必须包含结果数组');
  Assert.assertNotNull(formattedOutput.formattedText, '格式化输出必须包含格式化文本');
  Assert.assertNotNull(formattedOutput.csvData, '格式化输出必须包含CSV数据');
  
  // 验证摘要信息的完整性
  Assert.assertEquals(
    formattedOutput.summary.totalFiles,
    numResults,
    '摘要中的文件总数应该正确'
  );
  Assert.assertNotNull(formattedOutput.summary.searchDate, '摘要必须包含搜索日期');
  Assert.assertNotNull(formattedOutput.summary.fileTypes, '摘要必须包含文件类型统计');
  
  // 验证每个格式化结果的完整性
  formattedOutput.results.forEach((result, index) => {
    Assert.assertNotNull(result.fileName, `格式化结果 ${index + 1} 必须包含文件名`);
    Assert.assertNotNull(result.fileUrl, `格式化结果 ${index + 1} 必须包含访问链接`);
    Assert.assertNotNull(result.folderPath, `格式化结果 ${index + 1} 必须包含父级路径`);
    Assert.assertNotNull(result.fileType, `格式化结果 ${index + 1} 必须包含文件类型`);
    Assert.assertNotNull(result.lastModified, `格式化结果 ${index + 1} 必须包含最后修改时间`);
  });
  
  console.log(`✓ 格式化输出包含所有必需的完整信息`);
}

/**
 * 运行所有结果完整性相关测试
 */
function runAllResultCompletenessTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         属性测试 4: 结果完整性 - 完整测试套件             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    // 运行主属性测试
    runResultCompletenessPropertyTest();
    
    // 运行批量测试
    testBatchResultCompletenessProperty();
    
    // 运行格式化输出测试
    testFormattedOutputCompletenessProperty();
    
    console.log('\n✓ 所有结果完整性测试通过');
    
  } catch (error) {
    console.log(`\n✗ 结果完整性测试失败: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// 辅助函数：创建模拟对象
// ============================================================================

/**
 * 创建模拟的Drive文件对象
 * @return {Object} 模拟的文件对象
 */
function createMockFile() {
  const fileNames = [
    '项目报告.docx',
    '数据分析.xlsx',
    '会议记录.pdf',
    '设计文档.txt',
    '测试计划.doc'
  ];
  
  const mimeTypes = [
    'application/vnd.google-apps.document',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.google-apps.spreadsheet'
  ];
  
  const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
  const randomMimeType = mimeTypes[Math.floor(Math.random() * mimeTypes.length)];
  const randomId = PropertyTestGenerator.randomValidFolderId();
  
  return {
    getName: function() { return randomName; },
    getUrl: function() { return `https://drive.google.com/file/d/${randomId}/view`; },
    getMimeType: function() { return randomMimeType; },
    getLastUpdated: function() { 
      // 生成过去30天内的随机日期
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 30);
      return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    },
    getId: function() { return randomId; }
  };
}

/**
 * 生成随机的文件夹路径
 * @return {string} 随机文件夹路径
 */
function generateRandomFolderPath() {
  const pathSegments = [
    '我的云端硬盘',
    '项目文档',
    '2024年度',
    '技术资料',
    '会议记录',
    '设计文档',
    '测试数据',
    '归档文件'
  ];
  
  // 生成1-4层的路径
  const depth = Math.floor(Math.random() * 4) + 1;
  const selectedSegments = [];
  
  for (let i = 0; i < depth; i++) {
    const randomSegment = pathSegments[Math.floor(Math.random() * pathSegments.length)];
    selectedSegments.push(randomSegment);
  }
  
  return selectedSegments.join(' > ');
}
