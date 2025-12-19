/**
 * Google Drive 全文检索工具 - 一体化部署版本
 * 包含所有核心功能的单文件版本
 * 
 * 使用方法：
 * 1. 复制此文件内容到 Google Apps Script 的 Code.gs
 * 2. 添加 Web 界面 HTML 文件
 * 3. 部署为 Web 应用
 */

// ============================================================================
// 数据模型定义
// ============================================================================

/**
 * 创建搜索结果对象
 */
function createSearchResult(fileName, fileUrl, folderPath, fileType, lastModified) {
  return {
    fileName: fileName,
    fileUrl: fileUrl,
    folderPath: folderPath,
    fileType: fileType,
    lastModified: lastModified
  };
}

/**
 * 创建文件匹配对象
 */
function createFileMatch(file, parentPath) {
  return {
    file: file,
    parentPath: parentPath
  };
}

// ============================================================================
// 搜索控制器
// ============================================================================

class SearchController {
  constructor() {
    this.isInitialized = false;
    this.currentConfig = null;
  }

  validateInputs(folderId, keyword) {
    if (!folderId || typeof folderId !== 'string' || folderId.trim() === '') {
      return false;
    }
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return false;
    }
    return true;
  }

  validateFolderAccess(folderId) {
    try {
      const folder = DriveApp.getFolderById(folderId);
      folder.getName(); // 测试访问权限
      return true;
    } catch (error) {
      return false;
    }
  }

  initializeSearch(folderId, keyword, outputFormat) {
    this.currentConfig = {
      folderId: folderId,
      keyword: keyword,
      outputFormat: outputFormat,
      startTime: new Date()
    };
    this.isInitialized = true;
  }
}

function createSearchController() {
  return new SearchController();
}

// ============================================================================
// 内容匹配器
// ============================================================================

class ContentMatcher {
  constructor() {
    this.supportedMimeTypes = [
      'application/vnd.google-apps.document',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.google-apps.spreadsheet'
    ];
  }

  getSupportedMimeTypes() {
    return [...this.supportedMimeTypes];
  }

  searchFilesInFolder(folderId, keyword) {
    try {
      const folder = DriveApp.getFolderById(folderId);
      const query = this.buildSearchQuery(folderId, keyword);
      const files = DriveApp.searchFiles(query);
      
      const matchedFiles = [];
      while (files.hasNext()) {
        const file = files.next();
        if (this.validateFileAccess(file)) {
          matchedFiles.push(file);
        }
      }
      
      return matchedFiles;
    } catch (error) {
      console.log(`搜索文件时发生错误: ${error.message}`);
      return [];
    }
  }

  buildSearchQuery(folderId, keyword) {
    const mimeTypeQuery = this.supportedMimeTypes
      .map(type => `mimeType='${type}'`)
      .join(' or ');
    
    return `(${mimeTypeQuery}) and parents in '${folderId}' and fullText contains '${keyword}' and trashed=false`;
  }

  validateFileAccess(file) {
    try {
      file.getName();
      return true;
    } catch (error) {
      return false;
    }
  }
}

function createContentMatcher() {
  return new ContentMatcher();
}
// ============================================================================
// 文件夹遍历器
// ============================================================================

class FolderTraverser {
  constructor() {
    this.contentMatcher = null;
    this.maxDepth = 20;
    this.stats = {
      foldersProcessed: 0,
      filesFound: 0,
      maxDepth: 0
    };
  }

  setContentMatcher(contentMatcher) {
    this.contentMatcher = contentMatcher;
  }

  traverseFolder(folderId, keyword, currentDepth = 0) {
    if (currentDepth > this.maxDepth) {
      return [];
    }

    this.stats.maxDepth = Math.max(this.stats.maxDepth, currentDepth);
    this.stats.foldersProcessed++;

    const allMatches = [];
    
    try {
      // 搜索当前文件夹中的文件
      const matcher = this.contentMatcher || createContentMatcher();
      const files = matcher.searchFilesInFolder(folderId, keyword);
      
      const folder = DriveApp.getFolderById(folderId);
      const folderPath = this.buildFolderPath(folder);
      
      files.forEach(file => {
        allMatches.push(createFileMatch(file, folderPath));
        this.stats.filesFound++;
      });

      // 递归搜索子文件夹
      const subfolders = folder.getFolders();
      while (subfolders.hasNext()) {
        const subfolder = subfolders.next();
        try {
          const subMatches = this.traverseFolder(subfolder.getId(), keyword, currentDepth + 1);
          allMatches.push(...subMatches);
        } catch (error) {
          console.log(`访问子文件夹时发生错误: ${error.message}`);
        }
      }

    } catch (error) {
      console.log(`遍历文件夹时发生错误: ${error.message}`);
    }

    return allMatches;
  }

  buildFolderPath(folder) {
    const pathSegments = [];
    let currentFolder = folder;
    
    try {
      while (currentFolder) {
        pathSegments.unshift(currentFolder.getName());
        const parents = currentFolder.getParents();
        currentFolder = parents.hasNext() ? parents.next() : null;
        
        // 防止无限循环
        if (pathSegments.length > 10) break;
      }
    } catch (error) {
      // 如果无法获取完整路径，至少返回当前文件夹名称
      return folder.getName();
    }
    
    return pathSegments.join(' > ');
  }

  getTraversalStats() {
    return { ...this.stats };
  }
}

function createFolderTraverser() {
  return new FolderTraverser();
}

// ============================================================================
// 结果收集器
// ============================================================================

class ResultCollector {
  constructor() {
    this.results = [];
    this.outputFormat = 'logger';
  }

  collectResult(file, folderPath) {
    try {
      const fileName = file.getName();
      const fileUrl = file.getUrl();
      const fileType = this.getFileTypeName(file.getMimeType());
      const lastModified = file.getLastUpdated();

      const searchResult = createSearchResult(
        fileName,
        fileUrl,
        folderPath,
        fileType,
        lastModified
      );

      this.results.push(searchResult);
      return searchResult;
    } catch (error) {
      console.log(`收集结果时发生错误: ${error.message}`);
      return null;
    }
  }

  collectResults(fileMatches) {
    const collectedResults = [];
    
    for (const fileMatch of fileMatches) {
      const result = this.collectResult(fileMatch.file, fileMatch.parentPath);
      if (result) {
        collectedResults.push(result);
      }
    }
    
    return collectedResults;
  }

  setOutputFormat(format) {
    this.outputFormat = format;
  }

  outputToLogger(results = null) {
    const resultsToOutput = results || this.results;
    
    console.log('\n=== Google Drive 搜索结果 ===');
    console.log(`找到文件数量: ${resultsToOutput.length}`);
    console.log('\n详细结果:');
    
    resultsToOutput.forEach((result, index) => {
      console.log(`${index + 1}. ${result.fileName} (${result.fileType})`);
      console.log(`   路径: ${result.folderPath}`);
      console.log(`   链接: ${result.fileUrl}`);
      console.log('');
    });
  }

  outputToSheet(results = null, sheetName = null) {
    try {
      const resultsToOutput = results || this.results;
      const defaultSheetName = sheetName || `搜索结果_${new Date().toISOString().slice(0, 10)}`;

      const spreadsheet = SpreadsheetApp.create(defaultSheetName);
      const sheet = spreadsheet.getActiveSheet();
      
      // 设置表头
      const headers = ['序号', '文件名', '文件类型', '文件夹路径', '文件链接', '最后修改时间'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // 准备数据
      const data = resultsToOutput.map((result, index) => [
        index + 1,
        result.fileName,
        result.fileType,
        result.folderPath,
        result.fileUrl,
        result.lastModified.toLocaleString()
      ]);

      // 写入数据
      if (data.length > 0) {
        sheet.getRange(2, 1, data.length, headers.length).setValues(data);
      }

      // 自动调整列宽
      sheet.autoResizeColumns(1, headers.length);

      const sheetId = spreadsheet.getId();
      console.log(`结果已输出到Google Sheet: ${spreadsheet.getUrl()}`);
      return sheetId;

    } catch (error) {
      console.log(`输出到Google Sheet时发生错误: ${error.message}`);
      throw new Error(`无法创建Google Sheet: ${error.message}`);
    }
  }

  getFileTypeName(mimeType) {
    const typeMap = {
      'application/vnd.google-apps.document': 'Google Docs',
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
      'text/plain': '文本文件',
      'application/vnd.google-apps.spreadsheet': 'Google Sheets'
    };
    
    return typeMap[mimeType] || '未知类型';
  }

  getStatistics() {
    return {
      totalFiles: this.results.length
    };
  }
}

function createResultCollector() {
  return new ResultCollector();
}
// ============================================================================
// 异常处理器
// ============================================================================

class ExceptionHandler {
  constructor() {
    this.errorStats = {
      permissionErrors: 0,
      networkTimeouts: 0,
      otherErrors: 0
    };
  }

  handleError(error, context, additionalInfo = {}) {
    let errorType = 'unknown';
    
    if (error.message.includes('权限') || error.message.includes('Permission')) {
      errorType = 'permission';
      this.errorStats.permissionErrors++;
    } else if (error.message.includes('超时') || error.message.includes('timeout')) {
      errorType = 'timeout';
      this.errorStats.networkTimeouts++;
    } else {
      errorType = 'other';
      this.errorStats.otherErrors++;
    }
    
    console.log(`错误处理 [${errorType}]: ${error.message}`);
    
    return {
      type: errorType,
      message: error.message,
      context: context,
      additionalInfo: additionalInfo
    };
  }

  generateUserFriendlyErrorMessage(errorType, errorDetails) {
    switch (errorType) {
      case 'permission':
        return '无法访问某些文件或文件夹，请检查访问权限。搜索将继续处理其他文件。';
      case 'timeout':
        return '网络连接超时，建议稍后重试或使用增量搜索功能。';
      default:
        return `搜索过程中发生错误: ${errorDetails.message}`;
    }
  }

  getErrorStatistics() {
    return { ...this.errorStats };
  }
}

function createExceptionHandler() {
  return new ExceptionHandler();
}

// ============================================================================
// 主搜索函数
// ============================================================================

/**
 * 主搜索函数 - 用户调用的入口点
 */
function searchGoogleDrive(folderId, keyword, outputFormat = 'logger') {
  console.log('=== Google Drive 全文检索工具启动 ===');
  console.log(`搜索参数: 文件夹ID=${folderId}, 关键词="${keyword}", 输出格式=${outputFormat}`);
  
  // 创建核心组件实例
  const searchController = createSearchController();
  const folderTraverser = createFolderTraverser();
  const contentMatcher = createContentMatcher();
  const resultCollector = createResultCollector();
  const exceptionHandler = createExceptionHandler();
  
  // 设置组件依赖关系
  folderTraverser.setContentMatcher(contentMatcher);
  resultCollector.setOutputFormat(outputFormat);
  
  try {
    // 验证输入参数
    console.log('步骤 1: 验证输入参数');
    if (!searchController.validateInputs(folderId, keyword)) {
      throw new Error('输入验证失败：请提供有效的文件夹ID和搜索关键词');
    }
    
    if (!searchController.validateFolderAccess(folderId)) {
      throw new Error('文件夹访问验证失败：无法访问指定的文件夹或文件夹不存在');
    }
    
    searchController.initializeSearch(folderId, keyword, outputFormat);
    console.log('✓ 搜索配置初始化完成');
    
    // 执行搜索
    console.log('步骤 2: 开始搜索');
    const fileMatches = folderTraverser.traverseFolder(folderId, keyword);
    console.log(`✓ 搜索完成，找到 ${fileMatches.length} 个匹配文件`);
    
    // 收集结果
    console.log('步骤 3: 收集结果');
    const searchResults = resultCollector.collectResults(fileMatches);
    console.log(`✓ 结果收集完成，共 ${searchResults.length} 个有效结果`);
    
    // 输出结果
    console.log('步骤 4: 输出结果');
    if (outputFormat === 'sheet') {
      const sheetId = resultCollector.outputToSheet(searchResults);
      console.log(`✓ 结果已输出到Google Sheet`);
    } else {
      resultCollector.outputToLogger(searchResults);
      console.log('✓ 结果已输出到控制台');
    }
    
    // 输出统计信息
    const traversalStats = folderTraverser.getTraversalStats();
    const errorStats = exceptionHandler.getErrorStatistics();
    
    console.log('\n=== 搜索统计信息 ===');
    console.log(`处理文件夹数量: ${traversalStats.foldersProcessed}`);
    console.log(`找到文件数量: ${traversalStats.filesFound}`);
    console.log(`最大遍历深度: ${traversalStats.maxDepth}`);
    console.log(`权限错误数量: ${errorStats.permissionErrors}`);
    console.log(`网络超时数量: ${errorStats.networkTimeouts}`);
    console.log(`其他错误数量: ${errorStats.otherErrors}`);
    
    console.log('\n=== 搜索完成 ===');
    return searchResults;
    
  } catch (error) {
    const errorInfo = exceptionHandler.handleError(error, 'searchGoogleDrive', {
      folderId: folderId,
      keyword: keyword,
      outputFormat: outputFormat
    });
    
    const userFriendlyMessage = exceptionHandler.generateUserFriendlyErrorMessage(
      errorInfo.type, 
      { message: error.message }
    );
    
    console.error('搜索过程中发生错误:', userFriendlyMessage);
    throw new Error(userFriendlyMessage);
  }
}

/**
 * 简化的搜索接口
 */
function simpleSearch(folderId, keyword, options = {}) {
  const outputFormat = options.outputFormat || 'logger';
  
  console.log(`开始简单搜索: "${keyword}"`);
  
  try {
    return searchGoogleDrive(folderId, keyword, outputFormat);
  } catch (error) {
    console.error('搜索失败:', error.message);
    
    // 提供用户友好的错误建议
    if (error.message.includes('权限')) {
      console.log('建议: 请检查文件夹的访问权限设置');
    } else if (error.message.includes('超时')) {
      console.log('建议: 请尝试缩小搜索范围或稍后重试');
    }
    
    return [];
  }
}
// ============================================================================
// Web 应用程序接口
// ============================================================================

/**
 * Web应用程序入口点
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Google Drive 全文检索工具')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Web应用搜索函数
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
      maxResults: options.maxResults || null
    };
    
    // 执行搜索
    console.log('执行搜索...');
    let results = searchGoogleDrive(folderId, keyword, searchOptions.outputFormat);
    
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
    } else if (error.message.includes('超时')) {
      userFriendlyError = '搜索超时，请尝试缩小搜索范围。';
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
 * 验证文件夹访问权限
 */
function validateFolderAccess(folderId) {
  try {
    if (!folderId || folderId.trim() === '') {
      return {
        success: false,
        error: '请提供有效的文件夹ID'
      };
    }
    
    const folder = DriveApp.getFolderById(folderId);
    return {
      success: true,
      data: {
        folderName: folder.getName(),
        accessible: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: '无法访问指定文件夹，请检查文件夹ID是否正确'
    };
  }
}

/**
 * 获取文件夹信息
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

// ============================================================================
// 测试和演示函数
// ============================================================================

/**
 * 测试函数 - 用于验证工具功能
 */
function testSearchTool() {
  console.log('=== Google Drive 搜索工具测试 ===');
  
  // 测试用的文件夹ID（用户需要替换为实际的文件夹ID）
  const testFolderId = 'YOUR_FOLDER_ID_HERE';
  const testKeyword = 'test';
  
  if (testFolderId === 'YOUR_FOLDER_ID_HERE') {
    console.log('请在testSearchTool函数中设置有效的测试文件夹ID');
    console.log('在Google Drive中打开文件夹，从URL复制文件夹ID');
    console.log('例如：https://drive.google.com/drive/folders/1ABC...XYZ 中的 1ABC...XYZ');
    return;
  }
  
  try {
    console.log('开始测试基本搜索功能...');
    const results = simpleSearch(testFolderId, testKeyword, { outputFormat: 'logger' });
    console.log(`测试完成，找到 ${results.length} 个结果`);
    
    console.log('开始测试Web应用功能...');
    const webAppResult = performWebAppSearch(testFolderId, testKeyword, { outputFormat: 'logger' });
    console.log('Web应用测试结果:', JSON.stringify(webAppResult, null, 2));
    
    console.log('✓ 所有测试完成');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

/**
 * 快速演示函数
 */
function quickDemo() {
  console.log('=== 快速演示 ===');
  console.log('这是一个Google Drive全文检索工具演示');
  console.log('');
  console.log('主要功能：');
  console.log('1. 搜索Google Drive文件夹中的文档内容');
  console.log('2. 支持Google Docs、PDF、Word、TXT、Google Sheets');
  console.log('3. 递归搜索所有子文件夹');
  console.log('4. 输出到控制台或Google Sheet');
  console.log('5. Web界面操作');
  console.log('');
  console.log('使用方法：');
  console.log('1. 直接调用：searchGoogleDrive("文件夹ID", "关键词", "输出格式")');
  console.log('2. Web界面：部署为Web应用后通过浏览器使用');
  console.log('3. 简化接口：simpleSearch("文件夹ID", "关键词")');
  console.log('');
  console.log('要开始使用，请：');
  console.log('1. 修改testSearchTool()函数中的文件夹ID');
  console.log('2. 运行testSearchTool()进行测试');
  console.log('3. 部署为Web应用以获得用户界面');
}

// ============================================================================
// 初始化和配置
// ============================================================================

/**
 * 获取支持的文件类型
 */
function getSupportedFileTypes() {
  const matcher = createContentMatcher();
  return matcher.getSupportedMimeTypes();
}

/**
 * 获取工具版本信息
 */
function getToolInfo() {
  return {
    name: 'Google Drive 全文检索工具',
    version: '1.0.0',
    description: '基于Google Apps Script的云端文档搜索工具',
    supportedFileTypes: getSupportedFileTypes(),
    features: [
      '全文内容搜索',
      '递归文件夹遍历',
      '多种文件格式支持',
      'Web界面操作',
      '结果导出到Google Sheet',
      '异常处理和错误恢复'
    ]
  };
}

// ============================================================================
// 自动初始化
// ============================================================================

// 当脚本加载时显示工具信息
console.log('Google Drive 全文检索工具已加载');
console.log('运行 quickDemo() 查看功能介绍');
console.log('运行 testSearchTool() 进行功能测试');
console.log('部署为Web应用以获得用户界面');