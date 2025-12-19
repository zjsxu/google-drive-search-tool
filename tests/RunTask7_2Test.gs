/**
 * 任务 7.2 增量搜索策略测试
 * 测试增量搜索管理器的核心功能
 */

/**
 * 运行任务 7.2 增量搜索策略测试
 */
function runTask7_2IncrementalSearchTest() {
  console.log('=== 运行任务 7.2: 增量搜索策略测试 ===');
  
  try {
    // 测试增量搜索管理器创建
    testIncrementalSearchManagerCreation();
    
    // 测试文件数量阈值检测
    testFileCountThresholdDetection();
    
    // 测试搜索进度管理
    testSearchProgressManagement();
    
    // 测试分批处理逻辑
    testBatchProcessingLogic();
    
    // 测试进度保存和恢复
    testProgressSaveAndRestore();
    
    // 测试SearchController集成
    testSearchControllerIntegration();
    
    console.log('✅ 任务 7.2 增量搜索策略测试全部通过');
    return true;
    
  } catch (error) {
    console.error('❌ 任务 7.2 增量搜索策略测试失败:', error.message);
    console.error(error.stack);
    return false;
  }
}

/**
 * 测试增量搜索管理器创建
 */
function testIncrementalSearchManagerCreation() {
  console.log('测试: 增量搜索管理器创建');
  
  const manager = createIncrementalSearchManager();
  
  if (!manager) {
    throw new Error('增量搜索管理器创建失败');
  }
  
  if (manager.isInIncrementalMode()) {
    throw new Error('初始状态不应处于增量模式');
  }
  
  if (manager.getCurrentProgress() !== null) {
    throw new Error('初始进度应为null');
  }
  
  console.log('✓ 增量搜索管理器创建测试通过');
}

/**
 * 测试文件数量阈值检测
 */
function testFileCountThresholdDetection() {
  console.log('测试: 文件数量阈值检测');
  
  const manager = createIncrementalSearchManager();
  
  // 测试默认阈值 (1000)
  if (manager.shouldUseIncrementalSearch(500)) {
    throw new Error('500个文件不应使用增量搜索');
  }
  
  if (!manager.shouldUseIncrementalSearch(1500)) {
    throw new Error('1500个文件应使用增量搜索');
  }
  
  // 测试自定义阈值
  manager.setConfiguration({
    fileCountThreshold: 800,
    batchSize: 50
  });
  
  if (manager.shouldUseIncrementalSearch(700)) {
    throw new Error('700个文件不应使用增量搜索（新阈值800）');
  }
  
  if (!manager.shouldUseIncrementalSearch(900)) {
    throw new Error('900个文件应使用增量搜索（新阈值800）');
  }
  
  console.log('✓ 文件数量阈值检测测试通过');
}

/**
 * 测试搜索进度管理
 */
function testSearchProgressManagement() {
  console.log('测试: 搜索进度管理');
  
  const manager = createIncrementalSearchManager();
  
  // 初始化搜索进度
  manager.initializeSearchProgress('test-folder-id', 'test-keyword', 1200);
  
  const progress = manager.getCurrentProgress();
  if (!progress) {
    throw new Error('进度对象应被创建');
  }
  
  if (progress.folderId !== 'test-folder-id') {
    throw new Error('文件夹ID应正确');
  }
  
  if (progress.keyword !== 'test-keyword') {
    throw new Error('关键词应正确');
  }
  
  if (progress.totalFiles !== 1200) {
    throw new Error('总文件数应正确');
  }
  
  if (progress.processedFiles !== 0) {
    throw new Error('已处理文件数应为0');
  }
  
  if (!manager.isInIncrementalMode()) {
    throw new Error('应处于增量模式');
  }
  
  console.log('✓ 搜索进度管理测试通过');
}

/**
 * 测试分批处理逻辑
 */
function testBatchProcessingLogic() {
  console.log('测试: 分批处理逻辑');
  
  const manager = createIncrementalSearchManager();
  
  // 初始化
  manager.initializeSearchProgress('test-folder', 'keyword', 300);
  
  // 模拟文件列表
  const allFiles = [];
  for (let i = 0; i < 300; i++) {
    allFiles.push({ id: 'file_' + i, name: 'file_' + i + '.txt' });
  }
  
  // 获取第一批
  const firstBatch = manager.getNextBatch(allFiles);
  if (firstBatch.length !== 100) {
    throw new Error('第一批应有100个文件，实际: ' + firstBatch.length);
  }
  
  if (firstBatch[0].id !== 'file_0') {
    throw new Error('第一批第一个文件ID应为file_0，实际: ' + firstBatch[0].id);
  }
  
  // 处理第一批结果
  const mockResults = [
    { fileName: 'match1.txt', fileUrl: 'url1' },
    { fileName: 'match2.txt', fileUrl: 'url2' }
  ];
  
  const canContinue = manager.processBatchResults(mockResults, 100);
  if (!canContinue) {
    throw new Error('应该可以继续处理');
  }
  
  const progress = manager.getCurrentProgress();
  if (progress.processedFiles !== 100) {
    throw new Error('已处理文件数应为100，实际: ' + progress.processedFiles);
  }
  
  if (progress.currentBatch !== 1) {
    throw new Error('当前批次应为1，实际: ' + progress.currentBatch);
  }
  
  if (progress.results.length !== 2) {
    throw new Error('结果数量应为2，实际: ' + progress.results.length);
  }
  
  console.log('✓ 分批处理逻辑测试通过');
}

/**
 * 测试进度保存和恢复
 */
function testProgressSaveAndRestore() {
  console.log('测试: 进度保存和恢复');
  
  const manager = createIncrementalSearchManager();
  
  // 初始化并处理一些数据
  manager.initializeSearchProgress('test-folder', 'keyword', 500);
  manager.processBatchResults([{ fileName: 'test.txt' }], 100);
  
  // 保存进度
  const savedProgress = manager.saveProgress();
  if (!savedProgress) {
    throw new Error('应该能保存进度');
  }
  
  if (savedProgress.processedFiles !== 100) {
    throw new Error('保存的进度应正确，期望100，实际: ' + savedProgress.processedFiles);
  }
  
  if (savedProgress.results.length !== 1) {
    throw new Error('保存的结果数量应为1，实际: ' + savedProgress.results.length);
  }
  
  // 重置管理器
  manager.reset();
  if (manager.getCurrentProgress() !== null) {
    throw new Error('重置后进度应为null');
  }
  
  // 恢复进度
  const restored = manager.restoreProgress(savedProgress);
  if (!restored) {
    throw new Error('应该能恢复进度');
  }
  
  const restoredProgress = manager.getCurrentProgress();
  if (restoredProgress.processedFiles !== 100) {
    throw new Error('恢复的进度应正确，期望100，实际: ' + restoredProgress.processedFiles);
  }
  
  if (restoredProgress.folderId !== 'test-folder') {
    throw new Error('恢复的文件夹ID应正确');
  }
  
  console.log('✓ 进度保存和恢复测试通过');
}

/**
 * 测试SearchController集成
 */
function testSearchControllerIntegration() {
  console.log('测试: SearchController集成');
  
  const controller = createSearchController();
  
  // 测试增量搜索管理器存在
  const manager = controller.getIncrementalSearchManager();
  if (!manager) {
    throw new Error('增量搜索管理器应存在');
  }
  
  // 测试文件数量估算
  const estimatedCount = controller.estimateFileCount('test-folder-id');
  if (estimatedCount < 500 || estimatedCount > 2500) {
    throw new Error('估算文件数应在500-2500范围内，实际: ' + estimatedCount);
  }
  
  // 测试进度保存功能（初始状态）
  const progress = controller.saveSearchProgress();
  if (progress !== null) {
    throw new Error('初始状态下保存进度应返回null');
  }
  
  console.log('✓ SearchController集成测试通过');
}

/**
 * 运行增量搜索策略属性测试
 * **Feature: google-drive-search-tool, Property 8: 增量搜索策略**
 * **验证: 需求 4.2**
 */
function runIncrementalSearchStrategyPropertyTest() {
  console.log('=== 运行属性测试: 增量搜索策略 ===');
  
  try {
    // 手动运行多次迭代来测试属性
    const iterations = 50;
    let passed = 0;
    
    for (let i = 0; i < iterations; i++) {
      try {
        // 生成随机文件数量
        const fileCount = Math.floor(Math.random() * 3000) + 100; // 100-3100
        
        const manager = createIncrementalSearchManager();
        
        // 属性: 对于任何文件数量超过预设阈值的搜索操作，系统应该自动采用增量搜索策略
        const shouldUseIncremental = fileCount > manager.fileCountThreshold;
        const actuallyUsesIncremental = manager.shouldUseIncrementalSearch(fileCount);
        
        if (shouldUseIncremental !== actuallyUsesIncremental) {
          throw new Error('增量搜索策略决策不正确: 文件数=' + fileCount + 
                         ', 阈值=' + manager.fileCountThreshold + 
                         ', 期望=' + shouldUseIncremental + 
                         ', 实际=' + actuallyUsesIncremental);
        }
        
        // 如果使用增量搜索，验证能正确初始化
        if (actuallyUsesIncremental) {
          manager.initializeSearchProgress('test-folder', 'keyword', fileCount);
          
          if (!manager.isInIncrementalMode()) {
            throw new Error('应该处于增量模式');
          }
          
          const progress = manager.getCurrentProgress();
          if (!progress || progress.totalFiles !== fileCount) {
            throw new Error('增量搜索初始化失败');
          }
        }
        
        passed++;
        
      } catch (error) {
        console.error('迭代 ' + (i + 1) + ' 失败:', error.message);
        throw error; // 属性测试失败时立即停止
      }
    }
    
    console.log('属性测试完成: ' + passed + '/' + iterations + ' 通过');
    console.log('✅ 增量搜索策略属性测试通过');
    return true;
    
  } catch (error) {
    console.error('❌ 增量搜索策略属性测试失败:', error.message);
    return false;
  }
}

/**
 * 任务 7.2: 增量搜索策略属性测试 - 统一入口函数
 * **Feature: google-drive-search-tool, Property 8: 增量搜索策略**
 * **验证: 需求 4.2**
 */
function runTask7_2_IncrementalSearchPropertyTest() {
  console.log('=== 运行任务 7.2: 增量搜索策略属性测试 ===');
  
  try {
    runIncrementalSearchStrategyPropertyTest();
    console.log('✓ 任务 7.2 增量搜索策略属性测试完成');
  } catch (error) {
    console.log(`✗ 任务 7.2 增量搜索策略属性测试失败: ${error.message}`);
    throw error;
  }
}