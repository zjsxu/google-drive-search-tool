/**
 * ResultCollector演示文件
 * 展示如何使用ResultCollector类的Google Sheet输出功能
 */

/**
 * 演示ResultCollector的基本功能
 */
function demoResultCollector() {
  console.log('=== ResultCollector 功能演示 ===');
  
  // 创建ResultCollector实例
  const collector = createResultCollector();
  
  // 创建一些模拟的搜索结果用于演示
  const mockResults = createMockSearchResults();
  
  // 演示控制台输出
  console.log('\n1. 演示控制台输出:');
  collector.outputToLogger(mockResults);
  
  // 演示Google Sheet输出
  console.log('\n2. 演示Google Sheet输出:');
  try {
    const sheetId = collector.outputToSheet(mockResults, 'ResultCollector演示');
    console.log(`Google Sheet创建成功，ID: ${sheetId}`);
  } catch (error) {
    console.log(`Google Sheet创建失败: ${error.message}`);
  }
  
  // 演示结果格式化
  console.log('\n3. 演示结果格式化:');
  const formattedOutput = collector.formatResults(mockResults);
  console.log(`格式化结果包含 ${formattedOutput.results.length} 个文件`);
  console.log('文件类型统计:', formattedOutput.summary.fileTypes);
  
  console.log('\n=== 演示完成 ===');
}

/**
 * 创建模拟的搜索结果用于演示
 * @return {SearchResult[]} 模拟搜索结果数组
 */
function createMockSearchResults() {
  const mockResults = [
    createSearchResult(
      '项目文档.docx',
      'https://docs.google.com/document/d/mock1',
      '/项目文件夹/文档',
      'Google Docs',
      new Date('2024-01-15')
    ),
    createSearchResult(
      '数据分析报告.pdf',
      'https://drive.google.com/file/d/mock2',
      '/项目文件夹/报告',
      'PDF',
      new Date('2024-01-20')
    ),
    createSearchResult(
      '会议记录.txt',
      'https://drive.google.com/file/d/mock3',
      '/项目文件夹/会议',
      '文本文件',
      new Date('2024-01-25')
    ),
    createSearchResult(
      '预算表格.xlsx',
      'https://docs.google.com/spreadsheets/d/mock4',
      '/项目文件夹/财务',
      'Google Sheets',
      new Date('2024-01-30')
    )
  ];
  
  return mockResults;
}

/**
 * 演示批量数据写入功能
 */
function demoBatchWriting() {
  console.log('=== 批量写入演示 ===');
  
  const collector = createResultCollector();
  
  // 设置较小的批量大小用于演示
  collector.setBatchSize(2);
  
  // 创建更多的模拟数据
  const largeMockResults = [];
  for (let i = 1; i <= 5; i++) {
    largeMockResults.push(createSearchResult(
      `文件${i}.docx`,
      `https://docs.google.com/document/d/mock${i}`,
      `/文件夹${i}`,
      'Google Docs',
      new Date(2024, 0, i)
    ));
  }
  
  console.log(`创建了 ${largeMockResults.length} 个模拟结果`);
  
  try {
    const sheetId = collector.outputToSheet(largeMockResults, '批量写入演示');
    console.log(`批量写入演示完成，Sheet ID: ${sheetId}`);
  } catch (error) {
    console.log(`批量写入演示失败: ${error.message}`);
  }
  
  console.log('=== 批量写入演示完成 ===');
}

/**
 * 演示结果收集和格式化功能
 */
function demoResultCollection() {
  console.log('=== 结果收集演示 ===');
  
  const collector = createResultCollector();
  
  // 模拟文件匹配对象
  const mockFileMatches = [
    createFileMatch(createMockFile('测试文档1.docx', 'application/vnd.google-apps.document'), '/根目录/子目录1'),
    createFileMatch(createMockFile('测试PDF.pdf', 'application/pdf'), '/根目录/子目录2'),
    createFileMatch(createMockFile('测试表格.xlsx', 'application/vnd.google-apps.spreadsheet'), '/根目录/子目录3')
  ];
  
  // 批量收集结果
  const collectedResults = collector.collectResults(mockFileMatches);
  console.log(`收集了 ${collectedResults.length} 个结果`);
  
  // 演示统计功能
  const stats = collector.getStatistics();
  console.log('统计信息:', stats);
  
  // 演示过滤功能
  const pdfResults = collector.filterResultsByType('PDF');
  console.log(`PDF文件数量: ${pdfResults.length}`);
  
  // 演示排序功能
  const sortedByName = collector.sortResultsByName();
  console.log('按文件名排序的前3个文件:');
  sortedByName.slice(0, 3).forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.fileName}`);
  });
  
  console.log('=== 结果收集演示完成 ===');
}

/**
 * 创建模拟的Drive文件对象
 * @param {string} name - 文件名
 * @param {string} mimeType - MIME类型
 * @return {Object} 模拟的文件对象
 */
function createMockFile(name, mimeType) {
  return {
    getName: () => name,
    getUrl: () => `https://drive.google.com/file/d/mock_${name.replace(/\s+/g, '_')}`,
    getMimeType: () => mimeType,
    getLastUpdated: () => new Date(),
    getId: () => `mock_id_${name.replace(/\s+/g, '_')}`
  };
}

/**
 * 演示CSV导出功能
 */
function demoCSVExport() {
  console.log('=== CSV导出演示 ===');
  
  const collector = createResultCollector();
  const mockResults = createMockSearchResults();
  
  // 生成CSV数据
  const csvData = collector.generateCSVData(mockResults);
  console.log('CSV数据:');
  console.log(csvData);
  
  // 生成格式化文本
  const formattedText = collector.generateFormattedText(mockResults);
  console.log('\n格式化文本:');
  console.log(formattedText);
  
  console.log('=== CSV导出演示完成 ===');
}

/**
 * 运行所有演示
 */
function runAllDemos() {
  console.log('开始运行所有ResultCollector演示...\n');
  
  try {
    demoResultCollector();
    console.log('\n' + '='.repeat(50) + '\n');
    
    demoBatchWriting();
    console.log('\n' + '='.repeat(50) + '\n');
    
    demoResultCollection();
    console.log('\n' + '='.repeat(50) + '\n');
    
    demoCSVExport();
    
    console.log('\n所有演示运行完成！');
  } catch (error) {
    console.log(`演示运行时发生错误: ${error.message}`);
  }
}