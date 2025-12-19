/**
 * Task 6 集成测试
 * 测试ResultCollector与其他组件的集成
 */

/**
 * 运行Task 6的集成测试 - 统一入口函数
 */
function runTask6IntegrationTests() {
  console.log('=== Task 6 集成测试开始 ===');
  
  try {
    runTask6IntegrationTest();
    console.log('✓ Task 6 集成测试完成');
  } catch (error) {
    console.log(`✗ Task 6 集成测试失败: ${error.message}`);
    throw error;
  }
}

/**
 * 运行Task 6的集成测试
 */
function runTask6IntegrationTest() {
  console.log('=== Task 6 集成测试开始 ===');
  
  const framework = createTestFramework();
  
  // 测试ResultCollector与SearchController的集成
  testResultCollectorWithSearchController(framework);
  
  // 测试ResultCollector与ContentMatcher的集成
  testResultCollectorWithContentMatcher(framework);
  
  // 测试完整的搜索结果处理流程
  testCompleteResultProcessingFlow(framework);
  
  // 输出测试结果
  framework.printResults('Task 6 集成测试');
  
  console.log('=== Task 6 集成测试完成 ===');
  return framework.getResults();
}

/**
 * 测试ResultCollector与SearchController的集成
 */
function testResultCollectorWithSearchController(framework) {
  framework.describe('ResultCollector与SearchController集成测试', () => {
    framework.test('应该能够处理SearchController的配置', () => {
      const searchController = createSearchController();
      const resultCollector = createResultCollector();
      
      // 模拟搜索配置
      searchController.initializeSearch('test_folder_id', 'test_keyword', 'sheet');
      const config = searchController.getSearchConfiguration();
      
      // ResultCollector应该能够根据配置设置输出格式
      resultCollector.setOutputFormat(config.outputFormat);
      
      framework.assertEqual(resultCollector.getOutputFormat(), 'sheet', '输出格式应该与配置一致');
    });
  });
}

/**
 * 测试ResultCollector与ContentMatcher的集成
 */
function testResultCollectorWithContentMatcher(framework) {
  framework.describe('ResultCollector与ContentMatcher集成测试', () => {
    framework.test('应该能够处理ContentMatcher的文件类型信息', () => {
      const contentMatcher = createContentMatcher();
      const resultCollector = createResultCollector();
      
      // 测试文件类型名称映射
      const supportedTypes = contentMatcher.getSupportedMimeTypes();
      
      supportedTypes.forEach(mimeType => {
        const friendlyName = resultCollector.getFileTypeName(mimeType);
        framework.assertNotNull(friendlyName, `MIME类型 ${mimeType} 应该有友好名称`);
        framework.assertTrue(friendlyName.length > 0, '友好名称不应为空');
      });
    });
    
    framework.test('应该能够收集ContentMatcher找到的文件', () => {
      const resultCollector = createResultCollector();
      
      // 创建模拟的搜索结果（模拟ContentMatcher的输出）
      const mockFiles = [
        createMockFile('文档1.docx', 'application/vnd.google-apps.document'),
        createMockFile('报告.pdf', 'application/pdf'),
        createMockFile('表格.xlsx', 'application/vnd.google-apps.spreadsheet')
      ];
      
      // 收集结果
      mockFiles.forEach((file, index) => {
        const result = resultCollector.collectResult(file, `/路径${index + 1}`);
        framework.assertNotNull(result, `文件 ${file.getName()} 应该被成功收集`);
      });
      
      framework.assertEqual(resultCollector.getResultCount(), 3, '应该收集到3个结果');
    });
  });
}

/**
 * 测试完整的搜索结果处理流程
 */
function testCompleteResultProcessingFlow(framework) {
  framework.describe('完整结果处理流程测试', () => {
    framework.test('应该能够完成从收集到输出的完整流程', () => {
      // 1. 创建组件
      const searchController = createSearchController();
      const contentMatcher = createContentMatcher();
      const resultCollector = createResultCollector();
      
      // 2. 初始化搜索配置
      searchController.initializeSearch('test_folder', 'test_keyword', 'logger');
      const config = searchController.getSearchConfiguration();
      
      // 3. 设置ResultCollector的输出格式
      resultCollector.setOutputFormat(config.outputFormat);
      
      // 4. 模拟ContentMatcher找到的文件
      const mockFiles = [
        createMockFile('重要文档.docx', 'application/vnd.google-apps.document'),
        createMockFile('数据报告.pdf', 'application/pdf')
      ];
      
      // 5. 收集结果
      const fileMatches = mockFiles.map((file, index) => 
        createFileMatch(file, `/项目文件夹/子文件夹${index + 1}`)
      );
      
      const collectedResults = resultCollector.collectResults(fileMatches);
      
      // 6. 验证收集结果
      framework.assertEqual(collectedResults.length, 2, '应该收集到2个结果');
      framework.assertEqual(resultCollector.getResultCount(), 2, 'ResultCollector应该包含2个结果');
      
      // 7. 格式化结果
      const formattedOutput = resultCollector.formatResults();
      framework.assertNotNull(formattedOutput, '格式化输出不应为null');
      framework.assertEqual(formattedOutput.results.length, 2, '格式化结果应包含2个文件');
      
      // 8. 测试控制台输出（不会实际输出，只验证不出错）
      try {
        resultCollector.outputToLogger();
        framework.assertTrue(true, '控制台输出应该成功');
      } catch (error) {
        framework.fail(`控制台输出失败: ${error.message}`);
      }
      
      // 9. 验证统计信息
      const stats = resultCollector.getStatistics();
      framework.assertEqual(stats.totalFiles, 2, '统计信息中的总文件数应正确');
      framework.assertNotNull(stats.fileTypes, '文件类型统计应存在');
    });
    
    framework.test('应该能够处理空结果集', () => {
      const resultCollector = createResultCollector();
      
      // 测试空结果的格式化
      const formattedOutput = resultCollector.formatResults([]);
      framework.assertEqual(formattedOutput.results.length, 0, '空结果集格式化应返回空数组');
      framework.assertEqual(formattedOutput.summary.totalFiles, 0, '总文件数应为0');
      
      // 测试空结果的统计
      const stats = resultCollector.getStatistics();
      framework.assertEqual(stats.totalFiles, 0, '空结果集统计的总文件数应为0');
      framework.assertNull(stats.oldestFile, '空结果集的最旧文件应为null');
      framework.assertNull(stats.newestFile, '空结果集的最新文件应为null');
    });
  });
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
 * 快速验证Task 6的实现
 */
function quickVerifyTask6() {
  console.log('=== Task 6 快速验证 ===');
  
  try {
    // 验证ResultCollector类存在且可创建
    const collector = createResultCollector();
    console.log('✓ ResultCollector类创建成功');
    
    // 验证核心方法存在
    const methods = [
      'collectResult',
      'collectResults', 
      'formatResults',
      'outputToLogger',
      'outputToSheet',
      'batchWriteToSheet'
    ];
    
    methods.forEach(method => {
      if (typeof collector[method] === 'function') {
        console.log(`✓ ${method}方法存在`);
      } else {
        console.log(`✗ ${method}方法缺失`);
      }
    });
    
    // 验证基本功能
    const mockFile = createMockFile('测试.docx', 'application/vnd.google-apps.document');
    const result = collector.collectResult(mockFile, '/测试路径');
    
    if (result && result.fileName === '测试.docx') {
      console.log('✓ 结果收集功能正常');
    } else {
      console.log('✗ 结果收集功能异常');
    }
    
    // 验证格式化功能
    const formatted = collector.formatResults([result]);
    if (formatted && formatted.results && formatted.summary) {
      console.log('✓ 结果格式化功能正常');
    } else {
      console.log('✗ 结果格式化功能异常');
    }
    
    console.log('=== Task 6 验证完成 ===');
    return true;
    
  } catch (error) {
    console.log(`✗ Task 6 验证失败: ${error.message}`);
    return false;
  }
}

/**
 * 演示Task 6的完整功能
 */
function demoTask6Complete() {
  console.log('=== Task 6 完整功能演示 ===');
  
  try {
    // 1. 创建ResultCollector
    const collector = createResultCollector();
    console.log('1. ResultCollector创建完成');
    
    // 2. 创建模拟搜索结果
    const mockFiles = [
      createMockFile('项目计划.docx', 'application/vnd.google-apps.document'),
      createMockFile('技术文档.pdf', 'application/pdf'),
      createMockFile('数据表格.xlsx', 'application/vnd.google-apps.spreadsheet'),
      createMockFile('会议记录.txt', 'text/plain')
    ];
    
    console.log('2. 模拟文件创建完成');
    
    // 3. 收集结果
    mockFiles.forEach((file, index) => {
      collector.collectResult(file, `/项目根目录/子目录${index + 1}`);
    });
    
    console.log(`3. 结果收集完成，共收集 ${collector.getResultCount()} 个文件`);
    
    // 4. 生成统计信息
    const stats = collector.getStatistics();
    console.log('4. 统计信息生成完成:');
    console.log(`   - 总文件数: ${stats.totalFiles}`);
    console.log(`   - 文件类型: ${Object.keys(stats.fileTypes).join(', ')}`);
    console.log(`   - 平均路径长度: ${stats.averagePathLength}`);
    
    // 5. 格式化输出
    const formatted = collector.formatResults();
    console.log('5. 结果格式化完成');
    console.log(`   - 格式化结果包含 ${formatted.results.length} 个文件`);
    console.log(`   - CSV数据长度: ${formatted.csvData.length} 字符`);
    
    // 6. 控制台输出演示
    console.log('6. 控制台输出演示:');
    collector.outputToLogger();
    
    console.log('=== Task 6 演示完成 ===');
    return true;
    
  } catch (error) {
    console.log(`演示失败: ${error.message}`);
    return false;
  }
}