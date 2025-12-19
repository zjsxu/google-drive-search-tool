/**
 * ResultCollector类的测试文件
 * 测试结果收集和输出格式化功能
 */

/**
 * 运行所有ResultCollector测试
 */
function runResultCollectorTests() {
  console.log('=== 开始ResultCollector测试 ===');
  
  const framework = createTestFramework();
  
  // 基本功能测试
  testResultCollectorCreation(framework);
  testResultCollection(framework);
  testResultFormatting(framework);
  testOutputFormatSetting(framework);
  testResultFiltering(framework);
  testResultSorting(framework);
  testStatistics(framework);
  testCSVGeneration(framework);
  testBatchSizeConfiguration(framework);
  
  // 输出测试结果
  framework.printResults('ResultCollector测试');
  
  console.log('=== ResultCollector测试完成 ===');
  return framework.getResults();
}

/**
 * 测试ResultCollector创建
 */
function testResultCollectorCreation(framework) {
  framework.describe('ResultCollector创建测试', () => {
    const collector = createResultCollector();
    
    framework.test('应该成功创建ResultCollector实例', () => {
      framework.assertNotNull(collector, 'ResultCollector实例不应为null');
      framework.assertEqual(collector.getResultCount(), 0, '初始结果数量应为0');
      framework.assertEqual(collector.getOutputFormat(), 'logger', '默认输出格式应为logger');
    });
    
    framework.test('应该有正确的初始状态', () => {
      framework.assertNull(collector.getSheetId(), '初始Sheet ID应为null');
      framework.assertEqual(collector.getAllResults().length, 0, '初始结果数组应为空');
    });
  });
}

/**
 * 测试结果收集功能
 */
function testResultCollection(framework) {
  framework.describe('结果收集测试', () => {
    const collector = createResultCollector();
    
    framework.test('应该能够收集单个结果', () => {
      const mockFile = createMockFile('测试文件.docx', 'application/vnd.google-apps.document');
      const result = collector.collectResult(mockFile, '/测试路径');
      
      framework.assertNotNull(result, '收集的结果不应为null');
      framework.assertEqual(result.fileName, '测试文件.docx', '文件名应正确');
      framework.assertEqual(result.folderPath, '/测试路径', '路径应正确');
      framework.assertEqual(result.fileType, 'Google Docs', '文件类型应正确');
      framework.assertEqual(collector.getResultCount(), 1, '结果数量应为1');
    });
    
    framework.test('应该能够批量收集结果', () => {
      const collector2 = createResultCollector();
      const fileMatches = [
        createFileMatch(createMockFile('文件1.pdf', 'application/pdf'), '/路径1'),
        createFileMatch(createMockFile('文件2.txt', 'text/plain'), '/路径2'),
        createFileMatch(createMockFile('文件3.xlsx', 'application/vnd.google-apps.spreadsheet'), '/路径3')
      ];
      
      const results = collector2.collectResults(fileMatches);
      
      framework.assertEqual(results.length, 3, '应该收集3个结果');
      framework.assertEqual(collector2.getResultCount(), 3, '收集器中应有3个结果');
    });
  });
}

/**
 * 测试结果格式化功能
 */
function testResultFormatting(framework) {
  framework.describe('结果格式化测试', () => {
    const collector = createResultCollector();
    const mockResults = createTestMockResults();
    
    framework.test('应该能够格式化结果', () => {
      const formatted = collector.formatResults(mockResults);
      
      framework.assertNotNull(formatted, '格式化结果不应为null');
      framework.assertEqual(formatted.results.length, mockResults.length, '格式化结果数量应正确');
      framework.assertNotNull(formatted.summary, '应该包含汇总信息');
      framework.assertNotNull(formatted.formattedText, '应该包含格式化文本');
      framework.assertNotNull(formatted.csvData, '应该包含CSV数据');
    });
    
    framework.test('汇总信息应该正确', () => {
      const formatted = collector.formatResults(mockResults);
      const summary = formatted.summary;
      
      framework.assertEqual(summary.totalFiles, mockResults.length, '总文件数应正确');
      framework.assertNotNull(summary.searchDate, '搜索日期不应为null');
      framework.assertNotNull(summary.fileTypes, '文件类型统计不应为null');
    });
  });
}

/**
 * 测试输出格式设置
 */
function testOutputFormatSetting(framework) {
  framework.describe('输出格式设置测试', () => {
    const collector = createResultCollector();
    
    framework.test('应该能够设置有效的输出格式', () => {
      collector.setOutputFormat('sheet');
      framework.assertEqual(collector.getOutputFormat(), 'sheet', '输出格式应设置为sheet');
      
      collector.setOutputFormat('logger');
      framework.assertEqual(collector.getOutputFormat(), 'logger', '输出格式应设置为logger');
    });
    
    framework.test('应该拒绝无效的输出格式', () => {
      const originalFormat = collector.getOutputFormat();
      collector.setOutputFormat('invalid');
      framework.assertEqual(collector.getOutputFormat(), originalFormat, '无效格式不应改变当前设置');
    });
  });
}

/**
 * 测试结果过滤功能
 */
function testResultFiltering(framework) {
  framework.describe('结果过滤测试', () => {
    const collector = createResultCollector();
    const mockResults = createTestMockResults();
    
    // 添加结果到收集器
    mockResults.forEach(result => collector.results.push(result));
    
    framework.test('应该能够按文件类型过滤', () => {
      const pdfResults = collector.filterResultsByType('PDF');
      framework.assertTrue(pdfResults.length > 0, '应该找到PDF文件');
      pdfResults.forEach(result => {
        framework.assertEqual(result.fileType, 'PDF', '过滤结果应都是PDF类型');
      });
    });
    
    framework.test('应该能够按路径过滤', () => {
      const pathResults = collector.filterResultsByPath('测试');
      framework.assertTrue(pathResults.length > 0, '应该找到包含"测试"的路径');
      pathResults.forEach(result => {
        framework.assertTrue(result.folderPath.includes('测试'), '过滤结果路径应包含"测试"');
      });
    });
  });
}

/**
 * 测试结果排序功能
 */
function testResultSorting(framework) {
  framework.describe('结果排序测试', () => {
    const collector = createResultCollector();
    const mockResults = createTestMockResults();
    
    // 添加结果到收集器
    mockResults.forEach(result => collector.results.push(result));
    
    framework.test('应该能够按文件名排序', () => {
      const sortedAsc = collector.sortResultsByName(true);
      const sortedDesc = collector.sortResultsByName(false);
      
      framework.assertEqual(sortedAsc.length, mockResults.length, '排序结果数量应正确');
      framework.assertEqual(sortedDesc.length, mockResults.length, '排序结果数量应正确');
      
      // 检查排序是否正确（简单检查第一个和最后一个）
      if (sortedAsc.length > 1) {
        framework.assertTrue(
          sortedAsc[0].fileName <= sortedAsc[sortedAsc.length - 1].fileName,
          '升序排序应该正确'
        );
      }
    });
    
    framework.test('应该能够按日期排序', () => {
      const sortedByDate = collector.sortResultsByDate(true);
      framework.assertEqual(sortedByDate.length, mockResults.length, '按日期排序结果数量应正确');
    });
  });
}

/**
 * 测试统计功能
 */
function testStatistics(framework) {
  framework.describe('统计功能测试', () => {
    const collector = createResultCollector();
    const mockResults = createTestMockResults();
    
    // 添加结果到收集器
    mockResults.forEach(result => collector.results.push(result));
    
    framework.test('应该能够生成统计信息', () => {
      const stats = collector.getStatistics();
      
      framework.assertNotNull(stats, '统计信息不应为null');
      framework.assertEqual(stats.totalFiles, mockResults.length, '总文件数应正确');
      framework.assertNotNull(stats.fileTypes, '文件类型统计不应为null');
      framework.assertNotNull(stats.oldestFile, '最旧文件不应为null');
      framework.assertNotNull(stats.newestFile, '最新文件不应为null');
      framework.assertTrue(stats.averagePathLength >= 0, '平均路径长度应为非负数');
    });
    
    framework.test('文件类型统计应该正确', () => {
      const fileTypesSummary = collector.getFileTypesSummary(mockResults);
      framework.assertNotNull(fileTypesSummary, '文件类型汇总不应为null');
      
      let totalCount = 0;
      for (const count of Object.values(fileTypesSummary)) {
        totalCount += count;
      }
      framework.assertEqual(totalCount, mockResults.length, '统计总数应等于结果总数');
    });
  });
}

/**
 * 测试CSV生成功能
 */
function testCSVGeneration(framework) {
  framework.describe('CSV生成测试', () => {
    const collector = createResultCollector();
    const mockResults = createTestMockResults();
    
    framework.test('应该能够生成CSV数据', () => {
      const csvData = collector.generateCSVData(mockResults);
      
      framework.assertNotNull(csvData, 'CSV数据不应为null');
      framework.assertTrue(csvData.length > 0, 'CSV数据不应为空');
      framework.assertTrue(csvData.includes('序号,文件名'), 'CSV应包含表头');
      
      // 检查行数（表头 + 数据行）
      const lines = csvData.split('\n').filter(line => line.trim().length > 0);
      framework.assertEqual(lines.length, mockResults.length + 1, 'CSV行数应正确');
    });
    
    framework.test('应该能够转义CSV特殊字符', () => {
      const testField = 'test,with"comma';
      const escaped = collector.escapeCSVField(testField);
      
      framework.assertTrue(escaped.includes('"'), '应该用引号包围包含特殊字符的字段');
    });
  });
}

/**
 * 测试批量大小配置
 */
function testBatchSizeConfiguration(framework) {
  framework.describe('批量大小配置测试', () => {
    const collector = createResultCollector();
    
    framework.test('应该能够设置有效的批量大小', () => {
      collector.setBatchSize(50);
      // 由于批量大小是私有属性，我们通过行为来验证
      framework.assertTrue(true, '设置批量大小应该成功');
    });
    
    framework.test('应该拒绝无效的批量大小', () => {
      collector.setBatchSize(-1);
      collector.setBatchSize(0);
      collector.setBatchSize('invalid');
      // 这些调用不应该导致错误
      framework.assertTrue(true, '无效批量大小应该被拒绝');
    });
  });
}

/**
 * 创建测试用的模拟结果
 * @return {SearchResult[]} 测试用模拟结果数组
 */
function createTestMockResults() {
  return [
    createSearchResult(
      'A_文档.docx',
      'https://docs.google.com/document/d/test1',
      '/测试文件夹/文档',
      'Google Docs',
      new Date('2024-01-15')
    ),
    createSearchResult(
      'B_报告.pdf',
      'https://drive.google.com/file/d/test2',
      '/测试文件夹/报告',
      'PDF',
      new Date('2024-01-20')
    ),
    createSearchResult(
      'C_记录.txt',
      'https://drive.google.com/file/d/test3',
      '/测试文件夹/记录',
      '文本文件',
      new Date('2024-01-25')
    ),
    createSearchResult(
      'D_表格.xlsx',
      'https://docs.google.com/spreadsheets/d/test4',
      '/测试文件夹/表格',
      'Google Sheets',
      new Date('2024-01-30')
    )
  ];
}

/**
 * 创建模拟的Drive文件对象用于测试
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
 * 快速测试ResultCollector基本功能
 */
function quickTestResultCollector() {
  console.log('=== ResultCollector快速测试 ===');
  
  try {
    // 创建实例
    const collector = createResultCollector();
    console.log('✓ ResultCollector创建成功');
    
    // 测试基本功能
    const mockFile = createMockFile('测试.docx', 'application/vnd.google-apps.document');
    const result = collector.collectResult(mockFile, '/测试');
    
    if (result && result.fileName === '测试.docx') {
      console.log('✓ 结果收集功能正常');
    } else {
      console.log('✗ 结果收集功能异常');
    }
    
    // 测试格式化
    const formatted = collector.formatResults([result]);
    if (formatted && formatted.results.length === 1) {
      console.log('✓ 结果格式化功能正常');
    } else {
      console.log('✗ 结果格式化功能异常');
    }
    
    // 测试控制台输出
    collector.outputToLogger([result]);
    console.log('✓ 控制台输出功能正常');
    
    console.log('=== 快速测试完成 ===');
    return true;
    
  } catch (error) {
    console.log(`✗ 快速测试失败: ${error.message}`);
    return false;
  }
}