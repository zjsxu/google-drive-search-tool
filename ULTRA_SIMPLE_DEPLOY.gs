/**
 * Google Drive 全文检索工具 - 超简化版本
 * 完全兼容 Google Apps Script 语法
 */

// ============================================================================
// 数据模型函数
// ============================================================================

function createSearchResult(fileName, fileUrl, folderPath, fileType, lastModified) {
  return {
    fileName: fileName,
    fileUrl: fileUrl,
    folderPath: folderPath,
    fileType: fileType,
    lastModified: lastModified
  };
}

function createFileMatch(file, parentPath) {
  return {
    file: file,
    parentPath: parentPath
  };
}

// ============================================================================
// 搜索控制器函数
// ============================================================================

function validateInputs(folderId, keyword) {
  if (!folderId || typeof folderId !== 'string' || folderId.trim() === '') {
    return false;
  }
  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    return false;
  }
  return true;
}

function validateFolderAccess(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    folder.getName();
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// 内容匹配器函数
// ============================================================================

function getSupportedMimeTypes() {
  return [
    'application/vnd.google-apps.document',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.google-apps.spreadsheet'
  ];
}

function buildSearchQuery(folderId, keyword) {
  var mimeTypes = getSupportedMimeTypes();
  var mimeTypeQuery = mimeTypes.map(function(type) {
    return "mimeType='" + type + "'";
  }).join(' or ');
  
  return "(" + mimeTypeQuery + ") and parents in '" + folderId + "' and fullText contains '" + keyword + "' and trashed=false";
}

function searchFilesInFolder(folderId, keyword) {
  try {
    var query = buildSearchQuery(folderId, keyword);
    var files = DriveApp.searchFiles(query);
    var matchedFiles = [];
    
    while (files.hasNext()) {
      var file = files.next();
      try {
        file.getName();
        matchedFiles.push(file);
      } catch (error) {
        console.log('跳过无权限文件: ' + error.message);
      }
    }
    
    return matchedFiles;
  } catch (error) {
    console.log('搜索文件时发生错误: ' + error.message);
    return [];
  }
}

// ============================================================================
// 文件夹遍历函数
// ============================================================================

function buildFolderPath(folder) {
  var pathSegments = [];
  var currentFolder = folder;
  
  try {
    while (currentFolder && pathSegments.length < 10) {
      pathSegments.unshift(currentFolder.getName());
      var parents = currentFolder.getParents();
      currentFolder = parents.hasNext() ? parents.next() : null;
    }
  } catch (error) {
    return folder.getName();
  }
  
  return pathSegments.join(' > ');
}

function traverseFolder(folderId, keyword, currentDepth) {
  if (typeof currentDepth === 'undefined') {
    currentDepth = 0;
  }
  
  if (currentDepth > 20) {
    return [];
  }

  var allMatches = [];
  
  try {
    var files = searchFilesInFolder(folderId, keyword);
    var folder = DriveApp.getFolderById(folderId);
    var folderPath = buildFolderPath(folder);
    
    for (var i = 0; i < files.length; i++) {
      allMatches.push(createFileMatch(files[i], folderPath));
    }

    var subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      var subfolder = subfolders.next();
      try {
        var subMatches = traverseFolder(subfolder.getId(), keyword, currentDepth + 1);
        allMatches = allMatches.concat(subMatches);
      } catch (error) {
        console.log('访问子文件夹时发生错误: ' + error.message);
      }
    }

  } catch (error) {
    console.log('遍历文件夹时发生错误: ' + error.message);
  }

  return allMatches;
}

// ============================================================================
// 结果收集函数
// ============================================================================

function getFileTypeName(mimeType) {
  var typeMap = {
    'application/vnd.google-apps.document': 'Google Docs',
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
    'text/plain': '文本文件',
    'application/vnd.google-apps.spreadsheet': 'Google Sheets'
  };
  
  return typeMap[mimeType] || '未知类型';
}

function collectResult(file, folderPath) {
  try {
    var fileName = file.getName();
    var fileUrl = file.getUrl();
    var fileType = getFileTypeName(file.getMimeType());
    var lastModified = file.getLastUpdated();

    return createSearchResult(fileName, fileUrl, folderPath, fileType, lastModified);
  } catch (error) {
    console.log('收集结果时发生错误: ' + error.message);
    return null;
  }
}

function collectResults(fileMatches) {
  var collectedResults = [];
  
  for (var i = 0; i < fileMatches.length; i++) {
    var result = collectResult(fileMatches[i].file, fileMatches[i].parentPath);
    if (result) {
      collectedResults.push(result);
    }
  }
  
  return collectedResults;
}

function outputToLogger(results) {
  console.log('\n=== Google Drive 搜索结果 ===');
  console.log('找到文件数量: ' + results.length);
  console.log('\n详细结果:');
  
  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    console.log((i + 1) + '. ' + result.fileName + ' (' + result.fileType + ')');
    console.log('   路径: ' + result.folderPath);
    console.log('   链接: ' + result.fileUrl);
    console.log('');
  }
}

function outputToSheet(results, sheetName) {
  try {
    var defaultSheetName = sheetName || ('搜索结果_' + new Date().toISOString().slice(0, 10));
    var spreadsheet = SpreadsheetApp.create(defaultSheetName);
    var sheet = spreadsheet.getActiveSheet();
    
    var headers = ['序号', '文件名', '文件类型', '文件夹路径', '文件链接', '最后修改时间'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var data = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      data.push([
        i + 1,
        result.fileName,
        result.fileType,
        result.folderPath,
        result.fileUrl,
        result.lastModified.toLocaleString()
      ]);
    }

    if (data.length > 0) {
      sheet.getRange(2, 1, data.length, headers.length).setValues(data);
    }

    sheet.autoResizeColumns(1, headers.length);
    
    console.log('结果已输出到Google Sheet: ' + spreadsheet.getUrl());
    return spreadsheet.getId();

  } catch (error) {
    console.log('输出到Google Sheet时发生错误: ' + error.message);
    throw new Error('无法创建Google Sheet: ' + error.message);
  }
}
// ============================================================================
// 主搜索函数
// ============================================================================

function searchGoogleDrive(folderId, keyword, outputFormat) {
  if (typeof outputFormat === 'undefined') {
    outputFormat = 'logger';
  }
  
  console.log('=== Google Drive 全文检索工具启动 ===');
  console.log('搜索参数: 文件夹ID=' + folderId + ', 关键词="' + keyword + '", 输出格式=' + outputFormat);
  
  try {
    console.log('步骤 1: 验证输入参数');
    if (!validateInputs(folderId, keyword)) {
      throw new Error('输入验证失败：请提供有效的文件夹ID和搜索关键词');
    }
    
    if (!validateFolderAccess(folderId)) {
      throw new Error('文件夹访问验证失败：无法访问指定的文件夹或文件夹不存在');
    }
    
    console.log('✓ 搜索配置初始化完成');
    
    console.log('步骤 2: 开始搜索');
    var fileMatches = traverseFolder(folderId, keyword);
    console.log('✓ 搜索完成，找到 ' + fileMatches.length + ' 个匹配文件');
    
    console.log('步骤 3: 收集结果');
    var searchResults = collectResults(fileMatches);
    console.log('✓ 结果收集完成，共 ' + searchResults.length + ' 个有效结果');
    
    console.log('步骤 4: 输出结果');
    if (outputFormat === 'sheet') {
      outputToSheet(searchResults);
      console.log('✓ 结果已输出到Google Sheet');
    } else {
      outputToLogger(searchResults);
      console.log('✓ 结果已输出到控制台');
    }
    
    console.log('\n=== 搜索完成 ===');
    return searchResults;
    
  } catch (error) {
    console.error('搜索过程中发生错误:', error.message);
    throw error;
  }
}

function simpleSearch(folderId, keyword, options) {
  if (typeof options === 'undefined') {
    options = {};
  }
  
  var outputFormat = options.outputFormat || 'logger';
  
  console.log('开始简单搜索: "' + keyword + '"');
  
  try {
    return searchGoogleDrive(folderId, keyword, outputFormat);
  } catch (error) {
    console.error('搜索失败:', error.message);
    
    if (error.message.indexOf('权限') !== -1) {
      console.log('建议: 请检查文件夹的访问权限设置');
    } else if (error.message.indexOf('超时') !== -1) {
      console.log('建议: 请尝试缩小搜索范围或稍后重试');
    }
    
    return [];
  }
}

// ============================================================================
// Web 应用程序接口
// ============================================================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Google Drive 全文检索工具')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function performWebAppSearch(folderId, keyword, options) {
  if (typeof options === 'undefined') {
    options = {};
  }
  
  console.log('=== Web应用搜索请求 ===');
  console.log('参数: folderId=' + folderId + ', keyword="' + keyword + '"');
  
  try {
    if (!folderId || !keyword) {
      return {
        success: false,
        error: '请提供有效的文件夹ID和搜索关键词'
      };
    }
    
    var searchOptions = {
      outputFormat: options.outputFormat || 'logger',
      maxResults: options.maxResults || null
    };
    
    console.log('执行搜索...');
    var results = searchGoogleDrive(folderId, keyword, searchOptions.outputFormat);
    
    if (searchOptions.maxResults && results.length > searchOptions.maxResults) {
      results = results.slice(0, searchOptions.maxResults);
      console.log('结果已限制为前 ' + searchOptions.maxResults + ' 个');
    }
    
    console.log('Web应用搜索完成，返回 ' + results.length + ' 个结果');
    
    return {
      success: true,
      data: results,
      count: results.length,
      outputFormat: searchOptions.outputFormat
    };
    
  } catch (error) {
    console.error('Web应用搜索失败:', error.message);
    
    var userFriendlyError = error.message;
    
    if (error.message.indexOf('权限') !== -1) {
      userFriendlyError = '无法访问指定文件夹，请检查文件夹ID是否正确以及您是否有访问权限。';
    } else if (error.message.indexOf('超时') !== -1) {
      userFriendlyError = '搜索超时，请尝试缩小搜索范围。';
    } else if (error.message.indexOf('网络') !== -1) {
      userFriendlyError = '网络连接问题，请检查网络连接后重试。';
    }
    
    return {
      success: false,
      error: userFriendlyError,
      originalError: error.message
    };
  }
}

function getFolderInfo(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
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
// 测试函数
// ============================================================================

function testSearchTool() {
  console.log('=== Google Drive 搜索工具测试 ===');
  
  var testFolderId = 'YOUR_FOLDER_ID_HERE';
  var testKeyword = 'test';
  
  if (testFolderId === 'YOUR_FOLDER_ID_HERE') {
    console.log('请在testSearchTool函数中设置有效的测试文件夹ID');
    console.log('在Google Drive中打开文件夹，从URL复制文件夹ID');
    console.log('例如：https://drive.google.com/drive/folders/1ABC...XYZ 中的 1ABC...XYZ');
    return;
  }
  
  try {
    console.log('开始测试基本搜索功能...');
    var results = simpleSearch(testFolderId, testKeyword, { outputFormat: 'logger' });
    console.log('测试完成，找到 ' + results.length + ' 个结果');
    
    console.log('开始测试Web应用功能...');
    var webAppResult = performWebAppSearch(testFolderId, testKeyword, { outputFormat: 'logger' });
    console.log('Web应用测试结果:', JSON.stringify(webAppResult, null, 2));
    
    console.log('✓ 所有测试完成');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

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

// 自动初始化
console.log('Google Drive 全文检索工具已加载');
console.log('运行 quickDemo() 查看功能介绍');
console.log('运行 testSearchTool() 进行功能测试');
console.log('部署为Web应用以获得用户界面');