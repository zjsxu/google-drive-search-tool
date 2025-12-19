/**
 * Google Drive 全文检索自动化工具
 * 主入口文件
 * 实现需求 1.1, 1.2, 1.3, 1.4, 1.5
 */

/**
 * 主搜索函数 - 用户调用的入口点
 * 集成所有核心组件，实现完整的搜索工作流程
 * @param {string} folderId - Google Drive 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式 ('logger' 或 'sheet')
 * @param {Object} options - 可选配置参数
 * @return {SearchResult[]} 搜索结果数组
 */
function searchGoogleDrive(folderId, keyword, outputFormat = null, options = {}) {
  console.log('=== Google Drive 全文检索工具启动 ===');
  
  // 获取配置管理器并创建搜索专用配置
  const configManager = getGlobalConfigurationManager();
  const searchConfig = configManager.createSearchSpecificConfig({
    outputFormat: outputFormat,
    ...options
  });
  
  // 使用配置中的输出格式（如果未指定）
  const finalOutputFormat = outputFormat || searchConfig.output.defaultFormat;
  
  console.log(`搜索参数: 文件夹ID=${folderId}, 关键词="${keyword}", 输出格式=${finalOutputFormat}`);
  console.log(`配置摘要:`, JSON.stringify(configManager.getConfigurationSummary(), null, 2));
  
  // 创建核心组件实例
  const searchController = createSearchController();
  const folderTraverser = createFolderTraverser();
  const contentMatcher = createContentMatcher();
  const resultCollector = createResultCollector();
  const exceptionHandler = createExceptionHandler();
  
  // 设置组件之间的依赖关系和配置
  folderTraverser.setContentMatcher(contentMatcher);
  resultCollector.setOutputFormat(finalOutputFormat);
  resultCollector.setBatchSize(searchConfig.output.maxBatchSize);
  
  try {
    // 第一步：验证输入参数和初始化搜索配置
    console.log('步骤 1: 验证输入参数和初始化搜索配置');
    if (!searchController.validateInputs(folderId, keyword)) {
      throw new Error('输入验证失败：请提供有效的文件夹ID和搜索关键词');
    }
    
    if (!searchController.validateFolderAccess(folderId)) {
      throw new Error('文件夹访问验证失败：无法访问指定的文件夹或文件夹不存在');
    }
    
    searchController.initializeSearch(folderId, keyword, finalOutputFormat);
    console.log('✓ 搜索配置初始化完成');
    
    // 第二步：执行递归文件夹遍历和内容匹配
    console.log('步骤 2: 开始递归遍历文件夹并搜索匹配文件');
    const fileMatches = folderTraverser.traverseFolder(folderId, keyword);
    console.log(`✓ 文件夹遍历完成，找到 ${fileMatches.length} 个匹配文件`);
    
    // 第三步：收集和格式化搜索结果
    console.log('步骤 3: 收集和格式化搜索结果');
    const searchResults = resultCollector.collectResults(fileMatches);
    console.log(`✓ 结果收集完成，共 ${searchResults.length} 个有效结果`);
    
    // 第四步：输出搜索结果
    console.log('步骤 4: 输出搜索结果');
    if (finalOutputFormat === 'sheet') {
      const sheetName = searchConfig.output.sheetNameTemplate.replace('{date}', new Date().toISOString().slice(0, 10));
      const sheetId = resultCollector.outputToSheet(searchResults, sheetName);
      console.log(`✓ 结果已输出到Google Sheet，Sheet ID: ${sheetId}`);
    } else {
      resultCollector.outputToLogger(searchResults);
      console.log('✓ 结果已输出到控制台');
    }
    
    // 第五步：输出统计信息和性能数据
    console.log('步骤 5: 输出统计信息');
    const traversalStats = folderTraverser.getTraversalStats();
    const errorStats = exceptionHandler.getErrorStatistics();
    const resultStats = resultCollector.getStatistics();
    
    console.log('\n=== 搜索统计信息 ===');
    console.log(`处理文件夹数量: ${traversalStats.foldersProcessed}`);
    console.log(`找到文件数量: ${traversalStats.filesFound}`);
    console.log(`最大遍历深度: ${traversalStats.maxDepth}`);
    console.log(`权限错误数量: ${errorStats.permissionErrors}`);
    console.log(`网络超时数量: ${errorStats.networkTimeouts}`);
    console.log(`其他错误数量: ${errorStats.otherErrors}`);
    console.log(`有效结果数量: ${resultStats.totalFiles}`);
    
    console.log('\n=== 搜索完成 ===');
    return searchResults;
    
  } catch (error) {
    // 使用异常处理器处理错误
    const errorInfo = exceptionHandler.handleError(error, 'searchGoogleDrive', {
      folderId: folderId,
      keyword: keyword,
      outputFormat: finalOutputFormat
    });
    
    const userFriendlyMessage = exceptionHandler.generateUserFriendlyErrorMessage(
      errorInfo.type, 
      { 
        message: error.message,
        operationName: 'Google Drive搜索',
        details: error.message
      }
    );
    
    console.error('搜索过程中发生错误:', userFriendlyMessage);
    throw new Error(userFriendlyMessage);
  }
}

/**
 * 增量搜索函数 - 处理大量文件时使用
 * 实现需求 4.1, 4.2 - 性能优化和增量搜索
 * @param {string} folderId - Google Drive 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式 ('logger' 或 'sheet')
 * @param {Object} savedProgress - 保存的搜索进度（可选）
 * @return {Object} 搜索结果和进度信息
 */
function searchGoogleDriveIncremental(folderId, keyword, outputFormat = 'logger', savedProgress = null) {
  console.log('=== Google Drive 增量搜索工具启动 ===');
  
  const searchController = createSearchController();
  
  try {
    const result = searchController.performIncrementalSearch(folderId, keyword, outputFormat, savedProgress);
    
    if (result.isComplete) {
      console.log('✓ 增量搜索已完成');
    } else {
      console.log('⚠ 增量搜索未完成，可以保存进度后继续');
      console.log('保存进度信息:', JSON.stringify(result.progress, null, 2));
    }
    
    return result;
    
  } catch (error) {
    console.error('增量搜索过程中发生错误:', error.message);
    throw error;
  }
}

/**
 * 用户友好的搜索接口函数
 * 提供简化的参数和自动错误处理
 * @param {string} folderId - Google Drive 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {Object} options - 可选配置
 * @return {SearchResult[]} 搜索结果数组
 */
function simpleSearch(folderId, keyword, options = {}) {
  const config = {
    outputFormat: options.outputFormat || 'logger',
    useIncremental: options.useIncremental || false,
    maxResults: options.maxResults || null
  };
  
  console.log(`开始简单搜索: "${keyword}"`);
  
  try {
    if (config.useIncremental) {
      const result = searchGoogleDriveIncremental(folderId, keyword, config.outputFormat);
      return result.results || [];
    } else {
      return searchGoogleDrive(folderId, keyword, config.outputFormat);
    }
  } catch (error) {
    console.error('搜索失败:', error.message);
    
    // 提供用户友好的错误建议
    if (error.message.includes('权限')) {
      console.log('建议: 请检查文件夹的访问权限设置');
    } else if (error.message.includes('配额')) {
      console.log('建议: 请尝试使用增量搜索功能或稍后重试');
    } else if (error.message.includes('超时')) {
      console.log('建议: 请尝试使用增量搜索功能处理大量文件');
    }
    
    return [];
  }
}

/**
 * 批量搜索函数 - 在多个文件夹中搜索
 * @param {string[]} folderIds - 文件夹ID数组
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式
 * @return {SearchResult[]} 所有文件夹的搜索结果
 */
function batchSearch(folderIds, keyword, outputFormat = 'logger') {
  console.log(`=== 批量搜索启动 ===`);
  console.log(`搜索 ${folderIds.length} 个文件夹，关键词: "${keyword}"`);
  
  const allResults = [];
  const folderTraverser = createFolderTraverser();
  const resultCollector = createResultCollector();
  
  try {
    // 使用FolderTraverser的批量遍历功能
    const fileMatches = folderTraverser.traverseMultipleFolders(folderIds, keyword);
    const searchResults = resultCollector.collectResults(fileMatches);
    
    // 输出结果
    resultCollector.setOutputFormat(outputFormat);
    if (outputFormat === 'sheet') {
      resultCollector.outputToSheet(searchResults, `批量搜索结果_${new Date().toISOString().slice(0, 10)}`);
    } else {
      resultCollector.outputToLogger(searchResults);
    }
    
    console.log(`批量搜索完成，总共找到 ${searchResults.length} 个结果`);
    return searchResults;
    
  } catch (error) {
    console.error('批量搜索失败:', error.message);
    return [];
  }
}

/**
 * 获取文件夹结构信息（不执行搜索）
 * @param {string} folderId - 文件夹ID
 * @param {number} maxDepth - 最大遍历深度
 * @return {Object} 文件夹结构信息
 */
function getFolderStructure(folderId, maxDepth = 3) {
  console.log(`获取文件夹结构: ${folderId}`);
  
  const folderTraverser = createFolderTraverser();
  
  try {
    const structure = folderTraverser.getFolderStructure(folderId, maxDepth);
    console.log('文件夹结构获取完成');
    console.log(JSON.stringify(structure, null, 2));
    return structure;
  } catch (error) {
    console.error('获取文件夹结构失败:', error.message);
    return null;
  }
}

/**
 * 获取文件类型统计信息
 * @param {string} folderId - 文件夹ID
 * @param {boolean} recursive - 是否递归统计
 * @return {Object} 文件类型统计
 */
function getFileTypeStatistics(folderId, recursive = false) {
  console.log(`获取文件类型统计: ${folderId}`);
  
  const contentMatcher = createContentMatcher();
  const folderTraverser = createFolderTraverser();
  
  try {
    let stats;
    if (recursive) {
      stats = folderTraverser.getFileCountStatistics(folderId, true);
    } else {
      stats = contentMatcher.getFileTypeStatistics(folderId);
    }
    
    console.log('文件类型统计:');
    console.log(JSON.stringify(stats, null, 2));
    return stats;
  } catch (error) {
    console.error('获取文件类型统计失败:', error.message);
    return null;
  }
}

/**
 * 配置管理相关函数
 * 实现需求 4.4, 4.5 - 搜索配置参数管理和默认设置
 */

/**
 * 获取当前配置信息
 * @return {Object} 当前配置摘要
 */
function getCurrentConfig() {
  const configManager = getGlobalConfigurationManager();
  const summary = configManager.getConfigurationSummary();
  console.log('当前配置摘要:', JSON.stringify(summary, null, 2));
  return summary;
}

/**
 * 设置搜索配置
 * @param {Object} config - 搜索配置对象
 */
function setSearchConfig(config) {
  const configManager = getGlobalConfigurationManager();
  configManager.setUserConfiguration(config);
  console.log('搜索配置已更新');
}

/**
 * 重置配置为默认值
 */
function resetConfig() {
  const configManager = getGlobalConfigurationManager();
  configManager.resetToDefault();
  console.log('配置已重置为默认值');
}

/**
 * 导出当前配置
 * @return {string} JSON格式的配置
 */
function exportConfig() {
  const configManager = getGlobalConfigurationManager();
  const configJson = configManager.exportConfiguration();
  console.log('当前配置:', configJson);
  return configJson;
}

/**
 * 导入配置
 * @param {string} configJson - JSON格式的配置字符串
 * @return {boolean} 导入是否成功
 */
function importConfig(configJson) {
  const configManager = getGlobalConfigurationManager();
  return configManager.importConfiguration(configJson);
}

/**
 * 设置输出格式
 * @param {string} format - 输出格式 ('logger' 或 'sheet')
 */
function setDefaultOutputFormat(format) {
  const configManager = getGlobalConfigurationManager();
  configManager.setOutputFormat(format);
}

/**
 * 设置批量处理大小
 * @param {number} batchSize - 批量大小
 */
function setDefaultBatchSize(batchSize) {
  const configManager = getGlobalConfigurationManager();
  configManager.setBatchSize(batchSize);
}

/**
 * 启用或禁用增量搜索
 * @param {boolean} enabled - 是否启用
 */
function setIncrementalSearchEnabled(enabled) {
  const configManager = getGlobalConfigurationManager();
  configManager.setIncrementalSearchEnabled(enabled);
}

/**
 * 添加自定义文件类型
 * @param {string} mimeType - MIME类型
 * @param {string} displayName - 显示名称
 */
function addCustomFileType(mimeType, displayName) {
  const configManager = getGlobalConfigurationManager();
  configManager.addCustomFileType(mimeType, displayName);
}

/**
 * 获取所有支持的文件类型
 * @return {string[]} 支持的MIME类型数组
 */
function getSupportedFileTypes() {
  const configManager = getGlobalConfigurationManager();
  const types = configManager.getAllSupportedFileTypes();
  console.log('支持的文件类型:', types);
  return types;
}

/**
 * 使用预设配置的搜索函数
 */

/**
 * 快速搜索 - 使用快速搜索配置
 * @param {string} folderId - 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式
 * @return {SearchResult[]} 搜索结果
 */
function quickSearch(folderId, keyword, outputFormat = 'logger') {
  setQuickSearchConfig();
  return searchGoogleDrive(folderId, keyword, outputFormat);
}

/**
 * 深度搜索 - 使用深度搜索配置
 * @param {string} folderId - 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式
 * @return {SearchResult[]} 搜索结果
 */
function deepSearch(folderId, keyword, outputFormat = 'logger') {
  setDeepSearchConfig();
  return searchGoogleDrive(folderId, keyword, outputFormat);
}

/**
 * 性能优化搜索 - 使用性能优先配置
 * @param {string} folderId - 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式
 * @return {SearchResult[]} 搜索结果
 */
function performanceSearch(folderId, keyword, outputFormat = 'logger') {
  setPerformanceOptimizedConfig();
  return searchGoogleDrive(folderId, keyword, outputFormat);
}

/**
 * Web应用程序相关函数
 * 实现需求 1.1 - 用户界面和搜索结果显示功能
 */

/**
 * 提供HTML界面
 * Google Apps Script Web应用的入口点
 * @return {HtmlOutput} HTML界面
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Google Drive 全文检索工具')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 包含其他HTML文件的辅助函数
 * @param {string} filename - 文件名
 * @return {string} 文件内容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Web应用搜索函数
 * 处理来自HTML界面的搜索请求
 * @param {string} folderId - 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {Object} options - 搜索选项
 * @return {Object} 搜索结果对象
 */
function performWebAppSearch(folderId, keyword, options = {}) {
  console.log('=== Web应用搜索请求 ===');
  console.log(`参数: folderId=${folderId}, keyword="${keyword}"`);
  console.log(`选项:`, JSON.stringify(options, null, 2));
  
  try {
    // 验证输入参数
    if (!folderId || !keyword) {
      return {
        success: false,
        error: '请提供有效的文件夹ID和搜索关键词'
      };
    }
    
    // 准备搜索选项
    const searchOptions = {
      outputFormat: options.outputFormat || 'logger',
      useIncremental: options.useIncremental || false,
      maxResults: options.maxResults || null
    };
    
    let results;
    
    // 根据选项执行搜索
    if (searchOptions.useIncremental) {
      console.log('使用增量搜索模式');
      const incrementalResult = searchGoogleDriveIncremental(
        folderId, 
        keyword, 
        searchOptions.outputFormat
      );
      results = incrementalResult.results || [];
      
      // 如果增量搜索未完成，返回特殊状态
      if (!incrementalResult.isComplete) {
        return {
          success: true,
          data: results,
          incomplete: true,
          progress: incrementalResult.progress,
          message: '搜索未完成，已返回部分结果。可以保存进度后继续搜索。'
        };
      }
    } else {
      console.log('使用标准搜索模式');
      results = searchGoogleDrive(folderId, keyword, searchOptions.outputFormat, searchOptions);
    }
    
    // 应用结果数量限制
    if (searchOptions.maxResults && results.length > searchOptions.maxResults) {
      results = results.slice(0, searchOptions.maxResults);
      console.log(`结果已限制为前 ${searchOptions.maxResults} 个`);
    }
    
    console.log(`Web应用搜索完成，返回 ${results.length} 个结果`);
    
    return {
      success: true,
      data: results,
      count: results.length,
      outputFormat: searchOptions.outputFormat
    };
    
  } catch (error) {
    console.error('Web应用搜索失败:', error.message);
    
    // 生成用户友好的错误信息
    let userFriendlyError = error.message;
    
    if (error.message.includes('权限')) {
      userFriendlyError = '无法访问指定文件夹，请检查文件夹ID是否正确以及您是否有访问权限。';
    } else if (error.message.includes('配额')) {
      userFriendlyError = '已达到API使用配额限制，请稍后重试或使用增量搜索功能。';
    } else if (error.message.includes('超时')) {
      userFriendlyError = '搜索超时，请尝试使用增量搜索功能或缩小搜索范围。';
    } else if (error.message.includes('网络')) {
      userFriendlyError = '网络连接问题，请检查网络连接后重试。';
    }
    
    return {
      success: false,
      error: userFriendlyError,
      originalError: error.message
    };
  }
}

/**
 * 获取文件夹信息（用于Web界面验证）
 * @param {string} folderId - 文件夹ID
 * @return {Object} 文件夹信息
 */
function getFolderInfo(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    return {
      success: true,
      data: {
        name: folder.getName(),
        id: folder.getId(),
        url: folder.getUrl(),
        accessible: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: '无法访问指定文件夹，请检查文件夹ID是否正确以及您是否有访问权限。'
    };
  }
}

/**
 * 获取支持的文件类型列表（用于Web界面显示）
 * @return {Object} 支持的文件类型信息
 */
function getWebAppSupportedFileTypes() {
  try {
    const configManager = getGlobalConfigurationManager();
    const supportedTypes = configManager.getAllSupportedFileTypes();
    
    return {
      success: true,
      data: supportedTypes
    };
  } catch (error) {
    return {
      success: false,
      error: '获取支持的文件类型失败'
    };
  }
}

/**
 * 获取当前配置信息（用于Web界面显示）
 * @return {Object} 配置信息
 */
function getWebAppConfig() {
  try {
    const configManager = getGlobalConfigurationManager();
    const config = configManager.getConfigurationSummary();
    
    return {
      success: true,
      data: config
    };
  } catch (error) {
    return {
      success: false,
      error: '获取配置信息失败'
    };
  }
}

/**
 * 验证文件夹访问权限（用于Web界面实时验证）
 * @param {string} folderId - 文件夹ID
 * @return {Object} 验证结果
 */
function validateFolderAccess(folderId) {
  try {
    if (!folderId || folderId.trim() === '') {
      return {
        success: false,
        error: '请提供有效的文件夹ID'
      };
    }
    
    const searchController = createSearchController();
    const isValid = searchController.validateFolderAccess(folderId);
    
    if (isValid) {
      const folder = DriveApp.getFolderById(folderId);
      return {
        success: true,
        data: {
          folderName: folder.getName(),
          accessible: true
        }
      };
    } else {
      return {
        success: false,
        error: '无法访问指定文件夹'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: '文件夹验证失败: ' + error.message
    };
  }
}

/**
 * 测试函数 - 用于验证工具功能
 */
function testSearchTool() {
  console.log('=== Google Drive 搜索工具测试 ===');
  
  // 测试用的文件夹ID（需要用户替换为实际的文件夹ID）
  const testFolderId = 'YOUR_FOLDER_ID_HERE';
  const testKeyword = 'test';
  
  if (testFolderId === 'YOUR_FOLDER_ID_HERE') {
    console.log('请在testSearchTool函数中设置有效的测试文件夹ID');
    return;
  }
  
  try {
    console.log('开始测试配置管理功能...');
    getCurrentConfig();
    
    console.log('开始测试基本搜索功能...');
    const results = simpleSearch(testFolderId, testKeyword, { outputFormat: 'logger' });
    console.log(`测试完成，找到 ${results.length} 个结果`);
    
    console.log('开始测试快速搜索配置...');
    const quickResults = quickSearch(testFolderId, testKeyword, 'logger');
    console.log(`快速搜索完成，找到 ${quickResults.length} 个结果`);
    
    console.log('开始测试文件夹结构获取...');
    const structure = getFolderStructure(testFolderId, 2);
    
    console.log('开始测试文件类型统计...');
    const stats = getFileTypeStatistics(testFolderId, false);
    
    console.log('开始测试配置导出...');
    const configJson = exportConfig();
    
    console.log('开始测试Web应用功能...');
    const webAppResult = performWebAppSearch(testFolderId, testKeyword, { outputFormat: 'logger' });
    console.log('Web应用测试结果:', JSON.stringify(webAppResult, null, 2));
    
    console.log('✓ 所有测试完成');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}