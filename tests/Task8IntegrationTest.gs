/**
 * 任务8集成测试 - 测试主入口函数和配置管理
 * 验证所有组件的集成是否正确工作
 */

/**
 * 测试主搜索函数的集成
 */
function testTask8MainSearchIntegration() {
  console.log('=== 测试任务8 - 主搜索函数集成 ===');
  
  try {
    // 测试配置管理器创建
    const configManager = getGlobalConfigurationManager();
    assert(configManager !== null, '配置管理器应该能够创建');
    
    // 测试默认配置获取
    const defaultConfig = configManager.getCurrentConfiguration();
    assert(defaultConfig !== null, '应该能够获取默认配置');
    assert(defaultConfig.search !== undefined, '配置应该包含搜索设置');
    assert(defaultConfig.output !== undefined, '配置应该包含输出设置');
    
    // 测试配置摘要
    const summary = configManager.getConfigurationSummary();
    assert(summary.searchConfig !== undefined, '配置摘要应该包含搜索配置');
    assert(summary.outputConfig !== undefined, '配置摘要应该包含输出配置');
    
    console.log('✓ 配置管理器集成测试通过');
    
    // 测试组件创建
    const searchController = createSearchController();
    const folderTraverser = createFolderTraverser();
    const contentMatcher = createContentMatcher();
    const resultCollector = createResultCollector();
    const exceptionHandler = createExceptionHandler();
    
    assert(searchController !== null, '搜索控制器应该能够创建');
    assert(folderTraverser !== null, '文件夹遍历器应该能够创建');
    assert(contentMatcher !== null, '内容匹配器应该能够创建');
    assert(resultCollector !== null, '结果收集器应该能够创建');
    assert(exceptionHandler !== null, '异常处理器应该能够创建');
    
    console.log('✓ 核心组件创建测试通过');
    
    // 测试组件依赖关系设置
    folderTraverser.setContentMatcher(contentMatcher);
    resultCollector.setOutputFormat('logger');
    
    console.log('✓ 组件依赖关系设置测试通过');
    
    // 测试输入验证（使用无效输入）
    const isValidInput = searchController.validateInputs('invalid_id', '');
    assert(isValidInput === false, '无效输入应该被拒绝');
    
    const isValidKeyword = searchController.validateInputs('valid_folder_id_format_test', 'valid keyword');
    assert(isValidKeyword === true, '有效输入应该被接受');
    
    console.log('✓ 输入验证测试通过');
    
    console.log('=== 任务8主搜索函数集成测试完成 ===');
    return true;
    
  } catch (error) {
    console.error('任务8主搜索函数集成测试失败:', error.message);
    return false;
  }
}

/**
 * 测试配置管理功能
 */
function testTask8ConfigurationManagement() {
  console.log('=== 测试任务8 - 配置管理功能 ===');
  
  try {
    const configManager = getGlobalConfigurationManager();
    
    // 测试用户配置设置
    const originalConfig = configManager.getCurrentConfiguration();
    
    configManager.setUserConfiguration({
      search: {
        maxResults: 999,
        batchSize: 77
      },
      output: {
        defaultFormat: 'sheet'
      }
    });
    
    const updatedConfig = configManager.getCurrentConfiguration();
    assert(updatedConfig.search.maxResults === 999, '用户配置应该被正确应用');
    assert(updatedConfig.search.batchSize === 77, '批量大小配置应该被正确应用');
    assert(updatedConfig.output.defaultFormat === 'sheet', '输出格式配置应该被正确应用');
    
    console.log('✓ 用户配置设置测试通过');
    
    // 测试配置验证
    const validConfig = {
      search: {
        maxResults: 100,
        batchSize: 50
      }
    };
    
    const invalidConfig = {
      search: {
        maxResults: -1,
        batchSize: 'invalid'
      }
    };
    
    const validResult = configManager.validateConfiguration(validConfig);
    const invalidResult = configManager.validateConfiguration(invalidConfig);
    
    assert(validResult.isValid === true, '有效配置应该通过验证');
    assert(invalidResult.isValid === false, '无效配置应该被拒绝');
    assert(invalidResult.errors.length > 0, '无效配置应该返回错误信息');
    
    console.log('✓ 配置验证测试通过');
    
    // 测试配置导出和导入
    const exportedConfig = configManager.exportConfiguration();
    assert(typeof exportedConfig === 'string', '导出的配置应该是字符串');
    
    configManager.resetToDefault();
    const importResult = configManager.importConfiguration(exportedConfig);
    assert(importResult === true, '配置导入应该成功');
    
    console.log('✓ 配置导出导入测试通过');
    
    // 测试快捷配置函数
    setQuickSearchConfig();
    const quickConfig = configManager.getCurrentConfiguration();
    assert(quickConfig.search.maxResults === 500, '快速搜索配置应该被正确设置');
    
    setDeepSearchConfig();
    const deepConfig = configManager.getCurrentConfiguration();
    assert(deepConfig.search.maxResults === 5000, '深度搜索配置应该被正确设置');
    
    setPerformanceOptimizedConfig();
    const perfConfig = configManager.getCurrentConfiguration();
    assert(perfConfig.search.batchSize === 200, '性能优化配置应该被正确设置');
    
    console.log('✓ 快捷配置函数测试通过');
    
    // 重置为默认配置
    configManager.resetToDefault();
    
    console.log('=== 任务8配置管理功能测试完成 ===');
    return true;
    
  } catch (error) {
    console.error('任务8配置管理功能测试失败:', error.message);
    return false;
  }
}

/**
 * 测试用户友好接口函数
 */
function testTask8UserFriendlyInterfaces() {
  console.log('=== 测试任务8 - 用户友好接口函数 ===');
  
  try {
    // 测试配置管理接口函数
    const currentConfig = getCurrentConfig();
    assert(currentConfig !== null, '应该能够获取当前配置');
    
    // 测试输出格式设置
    setDefaultOutputFormat('sheet');
    const configAfterFormat = getGlobalConfigurationManager().getCurrentConfiguration();
    assert(configAfterFormat.output.defaultFormat === 'sheet', '输出格式应该被正确设置');
    
    // 测试批量大小设置
    setDefaultBatchSize(123);
    const configAfterBatch = getGlobalConfigurationManager().getCurrentConfiguration();
    assert(configAfterBatch.search.batchSize === 123, '批量大小应该被正确设置');
    
    // 测试增量搜索设置
    setIncrementalSearchEnabled(false);
    const configAfterIncremental = getGlobalConfigurationManager().getCurrentConfiguration();
    assert(configAfterIncremental.incremental.enabled === false, '增量搜索设置应该被正确应用');
    
    console.log('✓ 配置接口函数测试通过');
    
    // 测试文件类型管理
    const originalTypes = getSupportedFileTypes();
    const originalCount = originalTypes.length;
    
    addCustomFileType('application/test', '测试文件');
    const updatedTypes = getSupportedFileTypes();
    assert(updatedTypes.length === originalCount + 1, '自定义文件类型应该被添加');
    assert(updatedTypes.includes('application/test'), '新添加的文件类型应该在列表中');
    
    console.log('✓ 文件类型管理测试通过');
    
    // 测试配置导出导入接口
    const exportedConfig = exportConfig();
    assert(typeof exportedConfig === 'string', '配置导出应该返回字符串');
    
    resetConfig();
    const importResult = importConfig(exportedConfig);
    assert(importResult === true, '配置导入应该成功');
    
    console.log('✓ 配置导出导入接口测试通过');
    
    console.log('=== 任务8用户友好接口函数测试完成 ===');
    return true;
    
  } catch (error) {
    console.error('任务8用户友好接口函数测试失败:', error.message);
    return false;
  }
}

/**
 * 测试搜索专用配置创建
 */
function testTask8SearchSpecificConfig() {
  console.log('=== 测试任务8 - 搜索专用配置创建 ===');
  
  try {
    const configManager = getGlobalConfigurationManager();
    
    // 重置为默认配置
    configManager.resetToDefault();
    
    // 测试无选项的搜索配置创建
    const defaultSearchConfig = configManager.createSearchSpecificConfig();
    assert(defaultSearchConfig !== null, '应该能够创建默认搜索配置');
    assert(defaultSearchConfig.search !== undefined, '搜索配置应该包含搜索设置');
    
    // 测试带选项的搜索配置创建
    const customOptions = {
      maxResults: 777,
      batchSize: 88,
      outputFormat: 'sheet',
      useIncremental: true
    };
    
    const customSearchConfig = configManager.createSearchSpecificConfig(customOptions);
    assert(customSearchConfig.search.maxResults === 777, '自定义最大结果数应该被应用');
    assert(customSearchConfig.search.batchSize === 88, '自定义批量大小应该被应用');
    assert(customSearchConfig.output.defaultFormat === 'sheet', '自定义输出格式应该被应用');
    assert(customSearchConfig.incremental.enabled === true, '自定义增量搜索设置应该被应用');
    
    console.log('✓ 搜索专用配置创建测试通过');
    
    console.log('=== 任务8搜索专用配置创建测试完成 ===');
    return true;
    
  } catch (error) {
    console.error('任务8搜索专用配置创建测试失败:', error.message);
    return false;
  }
}

/**
 * 运行任务8的所有集成测试
 */
function runTask8IntegrationTests() {
  console.log('开始运行任务8集成测试...');
  
  const tests = [
    testTask8MainSearchIntegration,
    testTask8ConfigurationManagement,
    testTask8UserFriendlyInterfaces,
    testTask8SearchSpecificConfig
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`测试 ${test.name} 执行失败:`, error.message);
    }
  }
  
  console.log(`\n=== 任务8集成测试结果 ===`);
  console.log(`通过测试: ${passedTests}/${totalTests}`);
  console.log(`测试${passedTests === totalTests ? '全部通过' : '部分失败'}`);
  
  return passedTests === totalTests;
}