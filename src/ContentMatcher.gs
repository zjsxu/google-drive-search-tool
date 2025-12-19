/**
 * ContentMatcher类
 * 负责Drive API查询和内容匹配
 * 实现需求 1.2, 1.3, 5.2
 */

/**
 * ContentMatcher - 内容匹配器核心类
 * 实现Drive API查询语法构建、文件访问权限验证和全文搜索查询逻辑
 */
class ContentMatcher {
  constructor() {
    this.supportedMimeTypes = [
      'application/vnd.google-apps.document',      // Google Docs
      'application/pdf',                           // PDF
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
      'text/plain',                               // TXT
      'application/vnd.google-apps.spreadsheet'   // Google Sheets
    ];
  }

  /**
   * 在指定文件夹中搜索包含关键词的文件
   * 实现需求 1.2, 1.3 - 全文检索和内容匹配
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @return {GoogleAppsScript.Drive.File[]} 匹配的文件数组
   */
  searchFilesInFolder(folderId, keyword) {
    try {
      // 构建搜索查询
      const searchQuery = this.buildSearchQuery(folderId, keyword);
      
      console.log(`执行搜索查询: ${searchQuery}`);
      
      // 使用Drive API执行搜索
      const files = DriveApp.searchFiles(searchQuery);
      const matchedFiles = [];
      
      // 遍历搜索结果并验证访问权限
      while (files.hasNext()) {
        const file = files.next();
        
        // 验证文件访问权限
        if (this.validateFileAccess(file)) {
          // 验证文件类型支持
          if (this.isSupportedFileType(file)) {
            matchedFiles.push(file);
          } else {
            console.log(`跳过不支持的文件类型: ${file.getName()} (${file.getMimeType()})`);
          }
        } else {
          console.log(`跳过无访问权限的文件: ${file.getName()}`);
        }
      }
      
      console.log(`在文件夹 ${folderId} 中找到 ${matchedFiles.length} 个匹配文件`);
      return matchedFiles;
      
    } catch (error) {
      console.log(`搜索文件时发生错误: ${error.message}`);
      // 不抛出异常，返回空数组以保持搜索过程的稳定性
      return [];
    }
  }

  /**
   * 构建Drive API搜索查询语法
   * 实现需求 5.2 - 使用Drive API查询语法限定父文件夹范围
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @return {string} 构建的搜索查询字符串
   */
  buildSearchQuery(folderId, keyword) {
    // 转义关键词中的特殊字符
    const escapedKeyword = this.escapeSearchKeyword(keyword);
    
    // 构建基础查询：在指定文件夹中搜索包含关键词的文件
    let query = `parents in "${folderId}" and fullText contains "${escapedKeyword}"`;
    
    // 添加文件类型限制
    const mimeTypeConditions = this.supportedMimeTypes.map(mimeType => 
      `mimeType = "${mimeType}"`
    ).join(' or ');
    
    query += ` and (${mimeTypeConditions})`;
    
    // 排除回收站中的文件 (实现需求 5.4)
    query += ' and trashed = false';
    
    return query;
  }

  /**
   * 验证文件访问权限
   * 实现需求 1.2, 1.3 - 文件访问权限验证
   * @param {GoogleAppsScript.Drive.File} file - Drive文件对象
   * @return {boolean} 是否有访问权限
   */
  validateFileAccess(file) {
    try {
      // 尝试获取文件基本信息来验证访问权限
      const fileName = file.getName();
      const fileId = file.getId();
      const mimeType = file.getMimeType();
      
      // 如果能够获取这些基本信息，说明有访问权限
      if (fileName && fileId && mimeType) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      // 如果访问文件信息时出现异常，说明没有访问权限
      console.log(`文件访问权限验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查文件类型是否受支持
   * 实现需求 1.2 - 支持Google Docs、PDF、Word、TXT、Google Sheets
   * @param {GoogleAppsScript.Drive.File} file - Drive文件对象
   * @return {boolean} 是否为支持的文件类型
   */
  isSupportedFileType(file) {
    try {
      const mimeType = file.getMimeType();
      return this.supportedMimeTypes.includes(mimeType);
    } catch (error) {
      console.log(`检查文件类型时发生错误: ${error.message}`);
      return false;
    }
  }

  /**
   * 转义搜索关键词中的特殊字符
   * @param {string} keyword - 原始关键词
   * @return {string} 转义后的关键词
   */
  escapeSearchKeyword(keyword) {
    // Drive API搜索中需要转义的特殊字符
    return keyword.replace(/['"\\]/g, '\\$&');
  }

  /**
   * 获取支持的文件类型列表
   * @return {string[]} 支持的MIME类型数组
   */
  getSupportedMimeTypes() {
    return [...this.supportedMimeTypes];
  }

  /**
   * 检查指定的MIME类型是否受支持
   * @param {string} mimeType - MIME类型
   * @return {boolean} 是否受支持
   */
  isMimeTypeSupported(mimeType) {
    return this.supportedMimeTypes.includes(mimeType);
  }

  /**
   * 获取文件类型的友好名称
   * @param {string} mimeType - MIME类型
   * @return {string} 友好的文件类型名称
   */
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

  /**
   * 检测文件类型并返回处理策略
   * 实现需求 1.2 - 文件类型检测和处理逻辑
   * @param {GoogleAppsScript.Drive.File} file - Drive文件对象
   * @return {Object} 包含文件类型信息和处理策略的对象
   */
  detectFileTypeAndStrategy(file) {
    try {
      const mimeType = file.getMimeType();
      const fileName = file.getName();
      const fileExtension = this.getFileExtension(fileName);
      
      const strategy = {
        mimeType: mimeType,
        typeName: this.getFileTypeName(mimeType),
        isSupported: this.isMimeTypeSupported(mimeType),
        canSearchContent: this.canSearchFileContent(mimeType),
        requiresSpecialHandling: this.requiresSpecialHandling(mimeType),
        fileExtension: fileExtension,
        processingMethod: this.getProcessingMethod(mimeType)
      };
      
      return strategy;
      
    } catch (error) {
      console.log(`文件类型检测失败: ${error.message}`);
      return {
        mimeType: 'unknown',
        typeName: '未知类型',
        isSupported: false,
        canSearchContent: false,
        requiresSpecialHandling: false,
        fileExtension: '',
        processingMethod: 'none'
      };
    }
  }

  /**
   * 获取文件扩展名
   * @param {string} fileName - 文件名
   * @return {string} 文件扩展名
   */
  getFileExtension(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }
    
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return '';
    }
    
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }

  /**
   * 检查文件类型是否支持内容搜索
   * @param {string} mimeType - MIME类型
   * @return {boolean} 是否支持内容搜索
   */
  canSearchFileContent(mimeType) {
    // 所有支持的文件类型都支持全文搜索
    return this.isMimeTypeSupported(mimeType);
  }

  /**
   * 检查文件类型是否需要特殊处理
   * @param {string} mimeType - MIME类型
   * @return {boolean} 是否需要特殊处理
   */
  requiresSpecialHandling(mimeType) {
    // PDF和Word文档可能需要特殊的文本提取处理
    const specialHandlingTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return specialHandlingTypes.includes(mimeType);
  }

  /**
   * 获取文件的处理方法
   * @param {string} mimeType - MIME类型
   * @return {string} 处理方法标识
   */
  getProcessingMethod(mimeType) {
    const methodMap = {
      'application/vnd.google-apps.document': 'google_docs_api',
      'application/pdf': 'drive_api_fulltext',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'drive_api_fulltext',
      'text/plain': 'drive_api_fulltext',
      'application/vnd.google-apps.spreadsheet': 'google_sheets_api'
    };
    
    return methodMap[mimeType] || 'none';
  }

  /**
   * 处理多种文件类型的搜索
   * 实现需求 1.2 - 添加对Google Docs、PDF、Word、TXT、Google Sheets的支持
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {string[]} specificTypes - 指定要搜索的文件类型（可选）
   * @return {Object} 按文件类型分组的搜索结果
   */
  searchMultipleFileTypes(folderId, keyword, specificTypes = null) {
    const results = {
      googleDocs: [],
      pdf: [],
      word: [],
      text: [],
      googleSheets: [],
      total: 0,
      byType: {}
    };

    try {
      // 确定要搜索的文件类型
      const typesToSearch = specificTypes || this.supportedMimeTypes;
      
      // 为每种文件类型执行搜索
      for (const mimeType of typesToSearch) {
        if (this.isMimeTypeSupported(mimeType)) {
          console.log(`搜索文件类型: ${this.getFileTypeName(mimeType)}`);
          
          const typeResults = this.searchSpecificFileType(folderId, keyword, mimeType);
          const typeName = this.getFileTypeName(mimeType);
          
          // 将结果分类存储
          this.categorizeResults(results, typeResults, mimeType);
          
          console.log(`${typeName} 类型找到 ${typeResults.length} 个文件`);
        }
      }
      
      // 计算总数
      results.total = results.googleDocs.length + results.pdf.length + 
                     results.word.length + results.text.length + results.googleSheets.length;
      
      console.log(`多文件类型搜索完成，总共找到 ${results.total} 个文件`);
      return results;
      
    } catch (error) {
      console.log(`多文件类型搜索时发生错误: ${error.message}`);
      return results;
    }
  }

  /**
   * 搜索特定文件类型
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {string} mimeType - 特定的MIME类型
   * @return {GoogleAppsScript.Drive.File[]} 匹配的文件数组
   */
  searchSpecificFileType(folderId, keyword, mimeType) {
    try {
      // 构建针对特定文件类型的搜索查询
      const escapedKeyword = this.escapeSearchKeyword(keyword);
      const query = `parents in "${folderId}" and fullText contains "${escapedKeyword}" and mimeType = "${mimeType}" and trashed = false`;
      
      console.log(`执行特定类型搜索: ${query}`);
      
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
      console.log(`搜索特定文件类型时发生错误: ${error.message}`);
      return [];
    }
  }

  /**
   * 将搜索结果按类型分类
   * @param {Object} results - 结果对象
   * @param {GoogleAppsScript.Drive.File[]} files - 文件数组
   * @param {string} mimeType - MIME类型
   */
  categorizeResults(results, files, mimeType) {
    const typeName = this.getFileTypeName(mimeType);
    results.byType[typeName] = files;
    
    switch (mimeType) {
      case 'application/vnd.google-apps.document':
        results.googleDocs.push(...files);
        break;
      case 'application/pdf':
        results.pdf.push(...files);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        results.word.push(...files);
        break;
      case 'text/plain':
        results.text.push(...files);
        break;
      case 'application/vnd.google-apps.spreadsheet':
        results.googleSheets.push(...files);
        break;
    }
  }

  /**
   * 获取文件类型统计信息
   * @param {string} folderId - 文件夹ID
   * @return {Object} 文件类型统计
   */
  getFileTypeStatistics(folderId) {
    const stats = {
      total: 0,
      byType: {},
      supportedTypes: 0,
      unsupportedTypes: 0
    };

    try {
      // 获取文件夹中的所有文件
      const folder = DriveApp.getFolderById(folderId);
      const files = folder.getFiles();
      
      while (files.hasNext()) {
        const file = files.next();
        
        if (this.validateFileAccess(file)) {
          const mimeType = file.getMimeType();
          const typeName = this.getFileTypeName(mimeType);
          
          stats.total++;
          
          if (!stats.byType[typeName]) {
            stats.byType[typeName] = 0;
          }
          stats.byType[typeName]++;
          
          if (this.isMimeTypeSupported(mimeType)) {
            stats.supportedTypes++;
          } else {
            stats.unsupportedTypes++;
          }
        }
      }
      
      return stats;
      
    } catch (error) {
      console.log(`获取文件类型统计时发生错误: ${error.message}`);
      return stats;
    }
  }

  /**
   * 验证搜索查询的有效性
   * @param {string} query - 搜索查询字符串
   * @return {boolean} 查询是否有效
   */
  validateSearchQuery(query) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return false;
    }
    
    // 检查查询是否包含必要的组件
    const hasParentsClause = query.includes('parents in');
    const hasFullTextClause = query.includes('fullText contains');
    const hasTrashedClause = query.includes('trashed = false');
    
    return hasParentsClause && hasFullTextClause && hasTrashedClause;
  }
}

/**
 * 创建ContentMatcher实例的工厂函数
 * @return {ContentMatcher} ContentMatcher实例
 */
function createContentMatcher() {
  return new ContentMatcher();
}