/**
 * IncrementalSearchManager 测试
 * 测试增量搜索功能
 */

/**
 * 运行增量搜索管理器测试
 */
function runIncrementalSearchManagerTests() {
  const suite = new TestSuite('IncrementalSearchManager测试');

  // 测试增量搜索管理器基本功能
  suite.addTest('增量搜索管理器基本功能', function() {
    const manager = createIncrementalSearchManager();
    
    // 测试初始状态
    Assert.assertFalse(manager.isInIncrementalMode(), '初始状态不应处于增量模式');
    Assert.assertEquals(manager.getCurrentProgress(), null, '初始进度应为null');
    
    // 测试阈值检查
    Assert.assertFalse(manager.shouldUseIncrementalSearch(500), '500个文件不应使用增量搜索');
    Assert.assertTrue(manager.shouldUseIncrementalSearch(1500), '1500个文件应使用增量搜索');
    
    // 测试配置设置
    manager.setConfiguration({
      fileCountThreshold: 800,
      batchSize: 50
    });
    
    Assert.assertFalse(manager.shouldUseIncrementalSearch(700), '700个文件不应使用增量搜索（新阈值）');
    Assert.assertTrue(manager.shouldUseIncrementalSearch(900), '900个文件应使用增量搜索（新阈值）');
  });

  // 测试搜索进度初始化
  suite.addTest('搜索进度初始化', function() {
    const manager = createIncrementalSearchManager();
    
    // 初始化搜索进度
    manager.initializeSearchProgress('test-folder-id', 'test-keyword', 1200);
    
    const progress = manager.getCurrentProgress();
    Assert.assertNotNull(progress, '进度对象应被创建');
    Assert.assertEquals(progress.folderId, 'test-folder-id', '文件夹ID应正确');
    Assert.assertEquals(progress.keyword, 'test-keyword', '关键词应正确');
    Assert.assertEquals(progress.totalFiles, 1200, '总文件数应正确');
    Assert.assertEquals(progress.processedFiles, 0, '已处理文件数应为0');
    Assert.assertEquals(progress.currentBatch, 0, '当前批次应为0');
    Assert.assertTrue(manager.isInIncrementalMode(), '应处于增量模式');
  });

  // 测试批次处理
  suite.addTest('批次处理功能', function() {
    const manager = createIncrementalSearchManager();
    
    // 初始化
    manager.initializeSearchProgress('test-folder', 'keyword', 300);
    
    // 模拟文件列表
    const allFiles = [];
    for (let i = 0; i < 300; i++) {
      allFiles.push({ id: `file_${i}`, name: `file_${i}.txt` });
    }
    
    // 获取第一批
    const firstBatch = manager.getNextBatch(allFiles);
    Assert.assertEquals(firstBatch.length, 100, '第一批应有100个文件');
    Assert.assertEquals(firstBatch[0].id, 'file_0', '第一批第一个文件ID应正确');
    
    // 处理第一批结果
    const mockResults = [
      { fileName: 'match1.txt', fileUrl: 'url1' },
      { fileName: 'match2.txt', fileUrl: 'url2' }
    ];
    
    const canContinue = manager.processBatchResults(mockResults, 100);
    Assert.assertTrue(canContinue, '应该可以继续处理');
    
    const progress = manager.getCurrentProgress();
    Assert.assertEquals(progress.processedFiles, 100, '已处理文件数应为100');
    Assert.assertEquals(progress.currentBatch, 1, '当前批次应为1');
    Assert.assertEquals(progress.results.length, 2, '结果数量应为2');
    
    // 获取第二批
    const secondBatch = manager.getNextBatch(allFiles);
    Assert.assertEquals(secondBatch.length, 100, '第二批应有100个文件');
    Assert.assertEquals(secondBatch[0].id, 'file_100', '第二批第一个文件ID应正确');
  });

  // 测试搜索完成检查
  suite.addTest('搜索完成检查', function() {
    const manager = createIncrementalSearchManager();
    
    // 初始化小规模搜索
    manager.initializeSearchProgress('test-folder', 'keyword', 150);
    
    // 处理第一批
    manager.processBatchResults([], 100);
    Assert.assertFalse(manager.isSearchComplete(150), '处理100/150文件时不应完成');
    
    // 处理第二批
    manager.processBatchResults([], 50);
    Assert.assertTrue(manager.isSearchComplete(150), '处理150/150文件时应完成');
    
    const progress = manager.getCurrentProgress();
    Assert.assertTrue(progress.isComplete, '进度状态应标记为完成');
  });

  // 测试进度保存和恢复
  suite.addTest('进度保存和恢复', function() {
    const manager = createIncrementalSearchManager();
    
    // 初始化并处理一些数据
    manager.initializeSearchProgress('test-folder', 'keyword', 500);
    manager.processBatchResults([{ fileName: 'test.txt' }], 100);
    
    // 保存进度
    const savedProgress = manager.saveProgress();
    Assert.assertNotNull(savedProgress, '应该能保存进度');
    Assert.assertEquals(savedProgress.processedFiles, 100, '保存的进度应正确');
    Assert.assertEquals(savedProgress.results.length, 1, '保存的结果数量应正确');
    
    // 重置管理器
    manager.reset();
    Assert.assertEquals(manager.getCurrentProgress(), null, '重置后进度应为null');
    
    // 恢复进度
    const restored = manager.restoreProgress(savedProgress);
    Assert.assertTrue(restored, '应该能恢复进度');
    
    const restoredProgress = manager.getCurrentProgress();
    Assert.assertEquals(restoredProgress.processedFiles, 100, '恢复的进度应正确');
    Assert.assertEquals(restoredProgress.results.length, 1, '恢复的结果数量应正确');
    Assert.assertEquals(restoredProgress.folderId, 'test-folder', '恢复的文件夹ID应正确');
  });

  // 测试统计信息
  suite.addTest('统计信息功能', function() {
    const manager = createIncrementalSearchManager();
    
    // 初始化
    manager.initializeSearchProgress('test-folder', 'keyword', 200);
    
    // 处理一些数据
    manager.processBatchResults([{ fileName: 'match1.txt' }, { fileName: 'match2.txt' }], 100);
    
    const stats = manager.getSearchStats();
    Assert.assertNotNull(stats, '统计信息应存在');
    Assert.assertEquals(stats.totalFiles, 200, '总文件数应正确');
    Assert.assertEquals(stats.processedFiles, 100, '已处理文件数应正确');
    Assert.assertEquals(stats.remainingFiles, 100, '剩余文件数应正确');
    Assert.assertEquals(stats.totalResults, 2, '总结果数应正确');
    Assert.assertEquals(stats.progress, 50, '进度百分比应为50%');
    Assert.assertTrue(stats.isIncrementalMode, '应处于增量模式');
    Assert.assertFalse(stats.isComplete, '不应完成');
  });

  // 测试时间格式化
  suite.addTest('时间格式化功能', function() {
    const manager = createIncrementalSearchManager();
    
    Assert.assertEquals(manager.formatTime(5000), '5秒', '5秒格式化应正确');
    Assert.assertEquals(manager.formatTime(65000), '1分5秒', '1分5秒格式化应正确');
    Assert.assertEquals(manager.formatTime(125000), '2分5秒', '2分5秒格式化应正确');
  });

  suite.run();
}

/**
 * 运行增量搜索测试 - 统一入口函数
 */
function runIncrementalSearchTests() {
  console.log('=== 运行增量搜索测试 ===');
  
  try {
    // 运行增量搜索管理器测试
    runIncrementalSearchManagerTests();
    
    // 运行SearchController增量搜索集成测试
    runSearchControllerIncrementalIntegrationTests();
    
    console.log('✓ 增量搜索测试完成');
  } catch (error) {
    console.log(`✗ 增量搜索测试失败: ${error.message}`);
    throw error;
  }
}

/**
 * 运行SearchController增量搜索集成测试
 */
function runSearchControllerIncrementalIntegrationTests() {
  const suite = new TestSuite('SearchController增量搜索集成测试');

  // 测试增量搜索管理器集成
  suite.addTest('增量搜索管理器集成', function() {
    const controller = createSearchController();
    
    // 测试增量搜索管理器存在
    const manager = controller.getIncrementalSearchManager();
    Assert.assertNotNull(manager, '增量搜索管理器应存在');
    
    // 测试进度保存功能
    const progress = controller.saveSearchProgress();
    // 初始状态下应该返回null（没有进行中的搜索）
    Assert.assertEquals(progress, null, '初始状态下保存进度应返回null');
  });

  // 测试文件数量估算
  suite.addTest('文件数量估算', function() {
    const controller = createSearchController();
    
    const estimatedCount = controller.estimateFileCount('test-folder-id');
    Assert.assertTrue(estimatedCount >= 500, '估算文件数应至少500');
    Assert.assertTrue(estimatedCount <= 2500, '估算文件数应不超过2500');
  });

  suite.run();
}