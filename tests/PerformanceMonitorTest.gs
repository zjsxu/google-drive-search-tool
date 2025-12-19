/**
 * PerformanceMonitor 测试
 * 测试执行时间监控功能
 */

/**
 * 测试性能监控器基本功能
 */
function testPerformanceMonitorBasicFunctionality() {
  console.log('=== 测试性能监控器基本功能 ===');
  
  const monitor = createPerformanceMonitor();
  
  // 测试初始状态
  Assert.assertEquals(monitor.getElapsedTime(), 0, '初始执行时间应为0');
  Assert.assertFalse(monitor.isTimeout(), '初始状态不应超时');
  Assert.assertFalse(monitor.isNearTimeout(), '初始状态不应接近超时');
  
  // 开始监控
  monitor.startMonitoring();
  
  // 等待一小段时间
  Utilities.sleep(100);
  
  // 检查时间跟踪
  const elapsed = monitor.getElapsedTime();
  Assert.assertTrue(elapsed > 0, '执行时间应大于0');
  Assert.assertTrue(elapsed < 1000, '执行时间应小于1秒');
  
  // 添加检查点
  monitor.addCheckpoint('测试检查点1');
  monitor.addCheckpoint('测试检查点2', { testData: 'value' });
  
  const checkpoints = monitor.getCheckpoints();
  Assert.assertEquals(checkpoints.length, 2, '应有2个检查点');
  Assert.assertEquals(checkpoints[0].description, '测试检查点1', '检查点描述应正确');
  
  // 获取性能统计
  const stats = monitor.getPerformanceStats();
  Assert.assertTrue(stats.elapsedTime > 0, '统计中的执行时间应大于0');
  Assert.assertTrue(stats.remainingTime > 0, '剩余时间应大于0');
  Assert.assertEquals(stats.checkpointCount, 2, '检查点数量应为2');
  
  // 停止监控
  const totalTime = monitor.stopMonitoring();
  Assert.assertTrue(totalTime > 0, '总执行时间应大于0');
  
  console.log('✓ 性能监控器基本功能测试通过');
}

/**
 * 测试超时检测功能
 */
function testPerformanceMonitorTimeoutDetection() {
  console.log('=== 测试超时检测功能 ===');
  
  const monitor = createPerformanceMonitor();
  
  // 设置较短的超时限制用于测试
  monitor.setTimeoutLimits(200, 100); // 200ms超时，100ms警告
  
  monitor.startMonitoring();
  
  // 等待超过警告阈值
  Utilities.sleep(150);
  
  Assert.assertTrue(monitor.isNearTimeout(), '应检测到接近超时');
  Assert.assertFalse(monitor.isTimeout(), '还未完全超时');
  
  // 等待超过超时限制
  Utilities.sleep(100);
  
  Assert.assertTrue(monitor.isTimeout(), '应检测到超时');
  
  monitor.stopMonitoring();
  
  console.log('✓ 超时检测功能测试通过');
}

/**
 * 测试时间格式化功能
 */
function testPerformanceMonitorTimeFormatting() {
  console.log('=== 测试时间格式化功能 ===');
  
  const monitor = createPerformanceMonitor();
  
  // 测试秒级格式化
  Assert.assertEquals(monitor.formatTime(5000), '5秒', '5秒格式化应正确');
  Assert.assertEquals(monitor.formatTime(30000), '30秒', '30秒格式化应正确');
  
  // 测试分钟级格式化
  Assert.assertEquals(monitor.formatTime(60000), '1分0秒', '1分钟格式化应正确');
  Assert.assertEquals(monitor.formatTime(90000), '1分30秒', '1分30秒格式化应正确');
  Assert.assertEquals(monitor.formatTime(125000), '2分5秒', '2分5秒格式化应正确');
  
  console.log('✓ 时间格式化功能测试通过');
}

/**
 * 测试SearchController集成的性能监控
 */
function testSearchControllerPerformanceIntegration() {
  console.log('=== 测试SearchController性能监控集成 ===');
  
  const controller = createSearchController();
  
  // 测试性能监控器存在
  const monitor = controller.getPerformanceMonitor();
  Assert.assertNotNull(monitor, '性能监控器应存在');
  
  // 测试超时检查方法
  Assert.assertFalse(controller.isNearTimeout(), '初始状态不应接近超时');
  Assert.assertFalse(controller.isTimeout(), '初始状态不应超时');
  
  console.log('✓ SearchController性能监控集成测试通过');
}

/**
 * 运行所有性能监控测试
 */
function runPerformanceMonitorTests() {
  const suite = new TestSuite('PerformanceMonitor测试');

  // 测试性能监控器基本功能
  suite.addTest('性能监控器基本功能', function() {
    const monitor = createPerformanceMonitor();
    
    // 测试初始状态
    Assert.assertEquals(monitor.getElapsedTime(), 0, '初始执行时间应为0');
    Assert.assertFalse(monitor.isTimeout(), '初始状态不应超时');
    Assert.assertFalse(monitor.isNearTimeout(), '初始状态不应接近超时');
    
    // 开始监控
    monitor.startMonitoring();
    
    // 等待一小段时间
    Utilities.sleep(50);
    
    // 检查时间跟踪
    const elapsed = monitor.getElapsedTime();
    Assert.assertTrue(elapsed >= 0, '执行时间应大于等于0');
    
    // 添加检查点
    monitor.addCheckpoint('测试检查点1');
    monitor.addCheckpoint('测试检查点2', { testData: 'value' });
    
    const checkpoints = monitor.getCheckpoints();
    Assert.assertEquals(checkpoints.length, 2, '应有2个检查点');
    Assert.assertEquals(checkpoints[0].description, '测试检查点1', '检查点描述应正确');
    
    // 获取性能统计
    const stats = monitor.getPerformanceStats();
    Assert.assertTrue(stats.elapsedTime >= 0, '统计中的执行时间应大于等于0');
    Assert.assertTrue(stats.remainingTime > 0, '剩余时间应大于0');
    Assert.assertEquals(stats.checkpointCount, 2, '检查点数量应为2');
    
    // 停止监控
    const totalTime = monitor.stopMonitoring();
    Assert.assertTrue(totalTime >= 0, '总执行时间应大于等于0');
  });

  // 测试超时检测功能
  suite.addTest('超时检测功能', function() {
    const monitor = createPerformanceMonitor();
    
    // 设置较短的超时限制用于测试
    monitor.setTimeoutLimits(100, 50); // 100ms超时，50ms警告
    
    monitor.startMonitoring();
    
    // 等待超过警告阈值
    Utilities.sleep(60);
    
    Assert.assertTrue(monitor.isNearTimeout(), '应检测到接近超时');
    
    // 等待超过超时限制
    Utilities.sleep(50);
    
    Assert.assertTrue(monitor.isTimeout(), '应检测到超时');
    
    monitor.stopMonitoring();
  });

  // 测试时间格式化功能
  suite.addTest('时间格式化功能', function() {
    const monitor = createPerformanceMonitor();
    
    // 测试秒级格式化
    Assert.assertEquals(monitor.formatTime(5000), '5秒', '5秒格式化应正确');
    Assert.assertEquals(monitor.formatTime(30000), '30秒', '30秒格式化应正确');
    
    // 测试分钟级格式化
    Assert.assertEquals(monitor.formatTime(60000), '1分0秒', '1分钟格式化应正确');
    Assert.assertEquals(monitor.formatTime(90000), '1分30秒', '1分30秒格式化应正确');
    Assert.assertEquals(monitor.formatTime(125000), '2分5秒', '2分5秒格式化应正确');
  });

  // 测试SearchController集成的性能监控
  suite.addTest('SearchController性能监控集成', function() {
    const controller = createSearchController();
    
    // 测试性能监控器存在
    const monitor = controller.getPerformanceMonitor();
    Assert.assertNotNull(monitor, '性能监控器应存在');
    
    // 测试超时检查方法
    Assert.assertFalse(controller.isNearTimeout(), '初始状态不应接近超时');
    Assert.assertFalse(controller.isTimeout(), '初始状态不应超时');
  });

  suite.run();
}