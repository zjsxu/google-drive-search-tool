/**
 * FolderTraverser类
 * 负责递归文件夹遍历和路径信息收集
 * 实现需求 2.1, 2.2, 2.3, 2.4
 */

/**
 * FolderTraverser - 文件夹遍历器核心类
 * 实现递归文件夹遍历逻辑、子文件夹获取和处理方法、路径信息收集功能
 */
class FolderTraverser {
  constructor() {
    this.contentMatcher = null;
    this.traversalStats = {
      foldersProcessed: 0,
      filesFound: 0,
      maxDepth: 0,
      currentDepth: 0
    };
  }

  /**
   * 设置内容匹配器
   * @param {ContentMatcher} contentMatcher - 内容匹配器实例
   */
  setContentMatcher(contentMatcher) {
    this.contentMatcher = contentMatcher;
  }

  /**
   * 递归遍历文件夹并搜索匹配文件
   * 实现需求 2.1, 2.2, 2.3 - 递归遍历该文件夹的所有子文件夹
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {string} basePath - 基础路径（用于路径构建）
   * @param {number} currentDepth - 当前遍历深度
   * @return {FileMatch[]} 匹配的文件数组
   */
  traverseFolder(folderId, keyword, basePath = '', currentDepth = 0) {
    const allMatches = [];
    
    try {
      // 更新遍历统计信息
      this.traversalStats.currentDepth = currentDepth;
      if (currentDepth > this.traversalStats.maxDepth) {
        this.traversalStats.maxDepth = currentDepth;
      }
      this.traversalStats.foldersProcessed++;

      // 获取当前文件夹信息
      const folder = DriveApp.getFolderById(folderId);
      const folderName = folder.getName();
      
      // 构建当前文件夹的完整路径
      const currentPath = this.buildFolderPath(basePath, folderName);
      
      console.log(`遍历文件夹: ${currentPath} (深度: ${currentDepth})`);

      // 在当前文件夹中搜索匹配的文件
      const currentFolderMatches = this.processFolder(folder, keyword, currentPath);
      allMatches.push(...currentFolderMatches);

      // 获取并处理所有子文件夹
      const subfolders = this.getSubfolders(folderId);
      
      console.log(`在文件夹 ${currentPath} 中找到 ${subfolders.length} 个子文件夹`);

      // 递归遍历每个子文件夹
      for (const subfolder of subfolders) {
        try {
          const subfolderMatches = this.traverseFolder(
            subfolder.getId(), 
            keyword, 
            currentPath, 
            currentDepth + 1
          );
          allMatches.push(...subfolderMatches);
        } catch (error) {
          console.log(`遍历子文件夹时发生错误: ${subfolder.getName()} - ${error.message}`);
          // 继续处理其他子文件夹，不中断整个遍历过程
        }
      }

      console.log(`文件夹 ${currentPath} 遍历完成，找到 ${currentFolderMatches.length} 个匹配文件`);
      return allMatches;

    } catch (error) {
      console.log(`遍历文件夹 ${folderId} 时发生错误: ${error.message}`);
      // 返回已收集的结果，不中断整个搜索过程
      return allMatches;
    }
  }

  /**
   * 获取指定文件夹的所有子文件夹
   * 实现需求 2.2 - 自动进入子文件夹继续执行搜索操作
   * @param {string} folderId - 文件夹ID
   * @return {GoogleAppsScript.Drive.Folder[]} 子文件夹数组
   */
  getSubfolders(folderId) {
    const subfolders = [];
    
    try {
      const folder = DriveApp.getFolderById(folderId);
      const subfolderIterator = folder.getFolders();
      
      while (subfolderIterator.hasNext()) {
        const subfolder = subfolderIterator.next();
        
        // 验证子文件夹访问权限
        if (this.validateFolderAccess(subfolder)) {
          subfolders.push(subfolder);
        } else {
          console.log(`跳过无访问权限的子文件夹: ${subfolder.getName()}`);
        }
      }
      
      return subfolders;
      
    } catch (error) {
      console.log(`获取子文件夹时发生错误: ${error.message}`);
      return [];
    }
  }

  /**
   * 处理单个文件夹中的文件
   * 实现需求 2.3 - 确保覆盖所有层级的文件夹和文件
   * @param {GoogleAppsScript.Drive.Folder} folder - 文件夹对象
   * @param {string} keyword - 搜索关键词
   * @param {string} folderPath - 文件夹路径
   * @return {FileMatch[]} 匹配的文件数组
   */
  processFolder(folder, keyword, folderPath) {
    const matches = [];
    
    try {
      // 如果没有设置内容匹配器，创建一个默认的
      if (!this.contentMatcher) {
        this.contentMatcher = createContentMatcher();
      }

      // 使用ContentMatcher在当前文件夹中搜索文件
      const matchedFiles = this.contentMatcher.searchFilesInFolder(folder.getId(), keyword);
      
      // 为每个匹配的文件创建FileMatch对象
      for (const file of matchedFiles) {
        const fileMatch = createFileMatch(file, folderPath);
        matches.push(fileMatch);
        this.traversalStats.filesFound++;
      }
      
      console.log(`在文件夹 ${folderPath} 中处理了 ${matchedFiles.length} 个匹配文件`);
      return matches;
      
    } catch (error) {
      console.log(`处理文件夹 ${folderPath} 时发生错误: ${error.message}`);
      return [];
    }
  }

  /**
   * 构建文件夹路径
   * 实现需求 2.4 - 保存完整的父级路径信息用于结果溯源
   * @param {string} basePath - 基础路径
   * @param {string} folderName - 文件夹名称
   * @return {string} 完整的文件夹路径
   */
  buildFolderPath(basePath, folderName) {
    if (!basePath || basePath.trim() === '') {
      return folderName;
    }
    
    // 使用 '/' 作为路径分隔符
    return `${basePath}/${folderName}`;
  }

  /**
   * 验证文件夹访问权限
   * @param {GoogleAppsScript.Drive.Folder} folder - 文件夹对象
   * @return {boolean} 是否有访问权限
   */
  validateFolderAccess(folder) {
    try {
      // 尝试获取文件夹基本信息来验证访问权限
      const folderName = folder.getName();
      const folderId = folder.getId();
      
      // 如果能够获取这些基本信息，说明有访问权限
      if (folderName && folderId) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      // 如果访问文件夹信息时出现异常，说明没有访问权限
      console.log(`文件夹访问权限验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取文件夹的完整路径（从根目录开始）
   * @param {string} folderId - 文件夹ID
   * @return {string} 完整路径
   */
  getFullFolderPath(folderId) {
    const pathComponents = [];
    
    try {
      let currentFolder = DriveApp.getFolderById(folderId);
      
      // 向上遍历到根目录，收集路径组件
      while (currentFolder) {
        pathComponents.unshift(currentFolder.getName());
        
        const parents = currentFolder.getParents();
        if (parents.hasNext()) {
          currentFolder = parents.next();
        } else {
          break;
        }
      }
      
      return pathComponents.join('/');
      
    } catch (error) {
      console.log(`获取完整文件夹路径时发生错误: ${error.message}`);
      return '';
    }
  }

  /**
   * 获取遍历统计信息
   * @return {Object} 遍历统计数据
   */
  getTraversalStats() {
    return {
      ...this.traversalStats
    };
  }

  /**
   * 重置遍历统计信息
   */
  resetTraversalStats() {
    this.traversalStats = {
      foldersProcessed: 0,
      filesFound: 0,
      maxDepth: 0,
      currentDepth: 0
    };
  }

  /**
   * 检查遍历深度是否超过限制
   * @param {number} currentDepth - 当前深度
   * @param {number} maxDepth - 最大允许深度
   * @return {boolean} 是否超过限制
   */
  isDepthLimitExceeded(currentDepth, maxDepth = 50) {
    return currentDepth > maxDepth;
  }

  /**
   * 获取文件夹结构信息（不执行搜索）
   * @param {string} folderId - 文件夹ID
   * @param {number} maxDepth - 最大遍历深度
   * @return {Object} 文件夹结构信息
   */
  getFolderStructure(folderId, maxDepth = 10) {
    const structure = {
      id: folderId,
      name: '',
      path: '',
      subfolders: [],
      fileCount: 0,
      depth: 0
    };
    
    try {
      const folder = DriveApp.getFolderById(folderId);
      structure.name = folder.getName();
      structure.path = this.getFullFolderPath(folderId);
      
      // 计算文件数量
      const files = folder.getFiles();
      while (files.hasNext()) {
        files.next();
        structure.fileCount++;
      }
      
      // 如果没有超过最大深度，递归获取子文件夹结构
      if (maxDepth > 0) {
        const subfolders = this.getSubfolders(folderId);
        
        for (const subfolder of subfolders) {
          const subStructure = this.getFolderStructure(subfolder.getId(), maxDepth - 1);
          subStructure.depth = maxDepth - 1;
          structure.subfolders.push(subStructure);
        }
      }
      
      return structure;
      
    } catch (error) {
      console.log(`获取文件夹结构时发生错误: ${error.message}`);
      return structure;
    }
  }

  /**
   * 批量遍历多个文件夹
   * @param {string[]} folderIds - 文件夹ID数组
   * @param {string} keyword - 搜索关键词
   * @return {FileMatch[]} 所有匹配的文件
   */
  traverseMultipleFolders(folderIds, keyword) {
    const allMatches = [];
    
    for (let i = 0; i < folderIds.length; i++) {
      const folderId = folderIds[i];
      
      try {
        console.log(`开始遍历文件夹 ${i + 1}/${folderIds.length}: ${folderId}`);
        
        const matches = this.traverseFolder(folderId, keyword);
        allMatches.push(...matches);
        
        console.log(`文件夹 ${folderId} 遍历完成，找到 ${matches.length} 个匹配文件`);
        
      } catch (error) {
        console.log(`遍历文件夹 ${folderId} 时发生错误: ${error.message}`);
        // 继续处理下一个文件夹
      }
    }
    
    console.log(`批量遍历完成，总共找到 ${allMatches.length} 个匹配文件`);
    return allMatches;
  }

  /**
   * 检查文件夹是否为空
   * @param {string} folderId - 文件夹ID
   * @return {boolean} 文件夹是否为空
   */
  isFolderEmpty(folderId) {
    try {
      const folder = DriveApp.getFolderById(folderId);
      
      // 检查是否有文件
      const files = folder.getFiles();
      if (files.hasNext()) {
        return false;
      }
      
      // 检查是否有子文件夹
      const subfolders = folder.getFolders();
      if (subfolders.hasNext()) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.log(`检查文件夹是否为空时发生错误: ${error.message}`);
      return true; // 出错时假设为空
    }
  }

  /**
   * 获取文件夹中的文件数量统计
   * @param {string} folderId - 文件夹ID
   * @param {boolean} recursive - 是否递归统计
   * @return {Object} 文件数量统计
   */
  getFileCountStatistics(folderId, recursive = false) {
    const stats = {
      totalFiles: 0,
      totalFolders: 0,
      byFileType: {},
      depth: 0
    };
    
    try {
      const folder = DriveApp.getFolderById(folderId);
      
      // 统计当前文件夹中的文件
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        stats.totalFiles++;
        
        const mimeType = file.getMimeType();
        if (!stats.byFileType[mimeType]) {
          stats.byFileType[mimeType] = 0;
        }
        stats.byFileType[mimeType]++;
      }
      
      // 统计子文件夹
      const subfolders = folder.getFolders();
      while (subfolders.hasNext()) {
        const subfolder = subfolders.next();
        stats.totalFolders++;
        
        // 如果需要递归统计
        if (recursive) {
          const subStats = this.getFileCountStatistics(subfolder.getId(), true);
          stats.totalFiles += subStats.totalFiles;
          stats.totalFolders += subStats.totalFolders;
          
          // 合并文件类型统计
          for (const [type, count] of Object.entries(subStats.byFileType)) {
            if (!stats.byFileType[type]) {
              stats.byFileType[type] = 0;
            }
            stats.byFileType[type] += count;
          }
        }
      }
      
      return stats;
      
    } catch (error) {
      console.log(`获取文件统计时发生错误: ${error.message}`);
      return stats;
    }
  }
}

/**
 * 创建FolderTraverser实例的工厂函数
 * @return {FolderTraverser} FolderTraverser实例
 */
function createFolderTraverser() {
  return new FolderTraverser();
}