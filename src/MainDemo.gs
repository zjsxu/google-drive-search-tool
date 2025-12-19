/**
 * 主入口功能演示脚本
 * 展示任务8实现的集成功能和配置管理
 */

/**
 * 演示基本搜索功能
 */
function demoBasicSearch() {
  console.log('=== 演示基本搜索功能 ===');
  
  // 注意：请替换为实际的文件夹ID
  const testFolderId = 'YOUR_FOLDER_ID_HERE';
  const testKeyword = 'test';
  
  if (testFolderId === 'YOUR_FOLDER_ID_HERE') {
    console.log('请设置有效的测试文件夹ID');
    return;
  }
  
  try {
    console.log('1. 简单搜索演示');
    const simpleResults = simpleSearch(testFolderId, testKeyword, {
      outputFormat: 'logger'
    });
    console.log(`简单搜索完成，找到 ${simpleResults.length} 个结果`);
    
    console.log('\n2. 标准搜索演示');
    const standardResults = searchGoogleDrive(testFolderId, testKeyword, 'logger');
    console.log(`标准搜索完成，找到 ${standardResults.length} 个结果`);
    
    console.log('\n3. 快速搜索演示');
    const quickResults = quickSearch(testFolderId, testKeyword, 'logger');
    console.log(`快速搜索完成，找到 ${quickResults.length} 个结果`);
    
  } catch (error) {
    console.error('搜索演示失败:', error.message);
  }
}

/**
 * 演示配置管理功能
 */
function demoConfigurationManagement() {
  console.log('=== 演示配置管理功能 ===');
  
  try {
    console.log('1. 查看当前配置');
    const currentConfig = getCurrentConfig();
    console.log('当前配置摘要:', JSON.stringify(currentConfig, null, 2));
    
    console.log('\n2. 设置自定义配置');
    setSearchConfig({
      search: {
        maxResults: 777,
        batchSize: 88
      },
      output: {
        defaultFormat: 'sheet'
      }
    });
    
    const updatedConfig = getCurrentConfig();
    console.log('更新后配置:', JSON.stringify(updatedConfig, null, 2));
    
    console.log('\n3. 使用配置接口函数');
    setDefaultOutputFormat('logger');
    setDefaultBatchSize(123);
    setIncrementalSearchEnabled(true);
    
    console.log('\n4. 文件类型管理');
    const originalTypes = getSupportedFileTypes();
    console.log(`原始支持的文件类型数量: ${originalTypes.length}`);
    
    addCustomFileType('application/demo', '演示文件类型');
    const updatedTypes = getSupportedFileTypes();
    console.log(`添加自定义类型后数量: ${updatedTypes.length}`);
    
    console.log('\n5. 配置导出和导入');
    const exportedConfig = exportConfig();
    console.log('配置导出成功，长度:', exportedConfig.length);
    
    resetConfig();
    console.log('配置已重置为默认值');
    
    const importResult = importConfig(exportedConfig);
    console.log('配置导入结果:', importResult);
    
  } catch (error) {
    console.error('配置管理演示失败:', error.message);
  }
}

/**
 * 演示预设配置功能
 */
function demoPresetConfigurations() {
  console.log('=== 演示预设配置功能 ===');
  
  try {
    console.log('1. 快速搜索配置');
    setQuickSearchConfig();
    const quickConfig = getCurrentConfig();
    console.log('快速搜索配置:', JSON.stringify(quickConfig.searchConfig, null, 2));
    
    console.log('\n2. 深度搜索配置');
    setDeepSearchConfig();
    const deepConfig = getCurrentConfig();
    console.log('深度搜索配置:', JSON.stringify(deepConfig.searchConfig, null, 2));
    
    console.log('\n3. 性能优化配置');
    setPerformanceOptimizedConfig();
    const perfConfig = getCurrentConfig();
    console.log('性能优化配置:', JSON.stringify(perfConfig.searchConfig, null, 2));
    
    // 重置为默认配置
    resetConfig();
    console.log('\n配置已重置为默认值');
    
  } catch (error) {
    console.error('预设配置演示失败:', error.message);
  }
}

/**
 * 演示辅助功能
 */
function demoHelperFunctions() {
  console.log('=== 演示辅助功能 ===');
  
  const testFolderId = 'YOUR_FOLDER_ID_HERE';
  
  if (testFolderId === 'YOUR_FOLDER_ID_HERE') {
    console.log('请设置有效的测试文件夹ID');
    return;
  }
  
  try {
    console.log('1. 获取文件夹结构');
    const structure = getFolderStructure(testFolderId, 2);
    console.log('文件夹结构:', JSON.stringify(structure, null, 2));
    
    console.log('\n2. 获取文件类型统计');
    const stats = getFileTypeStatistics(testFolderId, false);
    console.log('文件类型统计:', JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('辅助功能演示失败:', error.message);
  }
}

/**
 * 演示组件集成
 */
function demoComponentIntegration() {
  console.log('=== 演示组件集成 ===');
  
  try {
    console.log('1. 创建核心组件');
    const searchController = createSearchController();
    const folderTraverser = createFolderTraverser();
    const contentMatcher = createContentMatcher();
    const resultCollector = createResultCollector();
    const exceptionHandler = createExceptionHandler();
    const configManager = getGlobalConfigurationManager();
    
    console.log('✓ 所有核心组件创建成功');
    
    console.log('\n2. 设置组件依赖关系');
    folderTraverser.setContentMatcher(contentMatcher);
    resultCollector.setOutputFormat('logger');
    
    console.log('✓ 组件依赖关系设置完成');
    
    console.log('\n3. 测试输入验证');
    const validInput = searchController.validateInputs('valid_folder_id_format', 'test keyword');
    const invalidInput = searchController.validateInputs('', '');
    
    console.log(`有效输入验证结果: ${validInput}`);
    console.log(`无效输入验证结果: ${invalidInput}`);
    
    console.log('\n4. 测试配置管理');
    const config = configManager.getCurrentConfiguration();
    console.log(`配置对象存在: ${config !== null}`);
    console.log(`搜索配置存在: ${config.search !== undefined}`);
    console.log(`输出配置存在: ${config.output !== undefined}`);
    
    console.log('\n✓ 组件集成演示完成');
    
  } catch (error) {
    console.error('组件集成演示失败:', error.message);
  }
}

/**
 * 运行所有演示
 */
function runAllDemos() {
  console.log('=== 开始运行所有演示 ===\n');
  
  try {
    demoComponentIntegration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    demoConfigurationManagement();
    console.log('\n' + '='.repeat(50) + '\n');
    
    demoPresetConfigurations();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 注意：以下演示需要有效的文件夹ID
    console.log('注意：以下演示需要设置有效的文件夹ID');
    console.log('请在相应函数中替换 YOUR_FOLDER_ID_HERE');
    
    // demoBasicSearch();
    // console.log('\n' + '='.repeat(50) + '\n');
    
    // demoHelperFunctions();
    
    console.log('\n=== 所有演示完成 ===');
    
  } catch (error) {
    console.error('演示运行失败:', error.message);
  }
}

/**
 * 快速功能验证
 */
function quickFunctionVerification() {
  console.log('=== 快速功能验证 ===');
  
  const functions = [
    'searchGoogleDrive',
    'searchGoogleDriveIncremental', 
    'simpleSearch',
    'quickSearch',
    'deepSearch',
    'performanceSearch',
    'batchSearch',
    'getCurrentConfig',
    'setSearchConfig',
    'resetConfig',
    'exportConfig',
    'importConfig',
    'setDefaultOutputFormat',
    'setDefaultBatchSize',
    'getSupportedFileTypes',
    'getFolderStructure',
    'getFileTypeStatistics'
  ];
  
  let existingFunctions = 0;
  let missingFunctions = [];
  
  for (const funcName of functions) {
    try {
      if (typeof eval(funcName) === 'function') {
        existingFunctions++;
      } else {
        missingFunctions.push(funcName);
      }
    } catch (error) {
      missingFunctions.push(funcName);
    }
  }
  
  console.log(`功能验证结果:`);
  console.log(`存在的函数: ${existingFunctions}/${functions.length}`);
  
  if (missingFunctions.length > 0) {
    console.log(`缺少的函数: ${missingFunctions.join(', ')}`);
  } else {
    console.log('✓ 所有主要函数都已实现');
  }
  
  // 验证配置管理器
  try {
    const configManager = getGlobalConfigurationManager();
    if (configManager) {
      console.log('✓ 配置管理器正常工作');
    } else {
      console.log('✗ 配置管理器创建失败');
    }
  } catch (error) {
    console.log('✗ 配置管理器验证失败:', error.message);
  }
  
  console.log('\n=== 快速功能验证完成 ===');
}