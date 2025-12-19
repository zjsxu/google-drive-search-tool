/**
 * 核心数据模型接口定义
 * Google Apps Script 使用 JSDoc 注释来定义类型
 */

/**
 * 搜索结果数据结构
 * @typedef {Object} SearchResult
 * @property {string} fileName - 文件名称
 * @property {string} fileUrl - 文件访问链接
 * @property {string} folderPath - 文件所在的完整路径
 * @property {string} fileType - 文件类型
 * @property {Date} lastModified - 最后修改时间
 */

/**
 * 文件匹配数据结构
 * @typedef {Object} FileMatch
 * @property {GoogleAppsScript.Drive.File} file - Google Drive 文件对象
 * @property {string} parentPath - 父级路径信息
 */

/**
 * 搜索配置数据结构
 * @typedef {Object} SearchConfiguration
 * @property {string} folderId - 目标文件夹ID
 * @property {string} keyword - 搜索关键词
 * @property {number} [maxResults] - 最大结果数量（可选）
 * @property {string[]} [includeFileTypes] - 包含的文件类型（可选）
 * @property {'logger'|'sheet'} outputFormat - 输出格式
 */

/**
 * 创建搜索结果对象的工厂函数
 * @param {string} fileName - 文件名
 * @param {string} fileUrl - 文件链接
 * @param {string} folderPath - 文件路径
 * @param {string} fileType - 文件类型
 * @param {Date} lastModified - 修改时间
 * @return {SearchResult} 搜索结果对象
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
 * 创建文件匹配对象的工厂函数
 * @param {GoogleAppsScript.Drive.File} file - Drive文件对象
 * @param {string} parentPath - 父级路径
 * @return {FileMatch} 文件匹配对象
 */
function createFileMatch(file, parentPath) {
  return {
    file: file,
    parentPath: parentPath
  };
}

/**
 * 创建搜索配置对象的工厂函数
 * @param {string} folderId - 文件夹ID
 * @param {string} keyword - 搜索关键词
 * @param {string} outputFormat - 输出格式
 * @param {Object} options - 可选配置
 * @return {SearchConfiguration} 搜索配置对象
 */
function createSearchConfiguration(folderId, keyword, outputFormat, options = {}) {
  return {
    folderId: folderId,
    keyword: keyword,
    maxResults: options.maxResults,
    includeFileTypes: options.includeFileTypes || ['application/vnd.google-apps.document', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.google-apps.spreadsheet'],
    outputFormat: outputFormat
  };
}