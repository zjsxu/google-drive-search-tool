/**
 * 搜索控制器类
 * 负责协调整个搜索流程和输入验证
 */

/**
 * SearchController - 搜索控制器核心类
 * 实现需求 1.1 和 5.3
 */
class SearchController {
  constructor() {
    this.isInitialized = false;
    this.searchConfiguration = null;
    this.performanceMonitor = createPerformanceMonitor();
    this.incrementalSearchManager = createIncrementalSearchManager();
    
    // 设置增量搜索管理器的性能监控器
    this.incrementalSearchManager.setPerformanceMonitor(this.performanceMonitor);
  }

  /**
   * 主搜索方法
   * @param {string} folderId - Google Drive 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {string} outputFormat - 输出格式 ('logger' 或 'sheet')
   * @return {SearchResult[]} 搜索结果数组
   */
  search(folderId, keyword, outputFormat = 'logger') {
    // 开始性能监控
    this.performanceMonitor.startMonitoring();
    this.performanceMonitor.addCheckpoint('搜索开始');

    try {
      // 验证输入参数
      if (!this.validateInputs(folderId, keyword)) {
        throw new Error('输入验证失败：请提供有效的文件夹ID和搜索关键词');
      }
      this.performanceMonitor.addCheckpoint('输入验证完成');

      // 验证文件夹访问权限
      if (!this.validateFolderAccess(folderId)) {
        throw new Error('文件夹访问验证失败：无法访问指定的文件夹或文件夹不存在');
      }
      this.performanceMonitor.addCheckpoint('文件夹访问验证完成');

      // 所有验证通过后，初始化搜索配置
      this.initializeSearch(folderId, keyword, outputFormat);
      this.performanceMonitor.addCheckpoint('搜索配置初始化完成');

      console.log(`开始搜索 - 文件夹ID: ${folderId}, 关键词: ${keyword}, 输出格式: ${outputFormat}`);
      
      // 实际搜索逻辑将在后续任务中实现
      // 这里返回空数组作为占位符
      const results = [];
      
      this.performanceMonitor.addCheckpoint('搜索完成', { resultCount: results.length });
      return results;

    } finally {
      // 停止性能监控并输出统计信息
      const totalTime = this.performanceMonitor.stopMonitoring();
      const stats = this.performanceMonitor.getPerformanceStats();
      
      console.log('=== 性能统计 ===');
      console.log(`总执行时间: ${stats.formattedElapsed}`);
      console.log(`剩余时间: ${stats.formattedRemaining}`);
      console.log(`检查点数量: ${stats.checkpointCount}`);
      
      if (stats.isNearTimeout) {
        console.warn('警告: 执行时间接近限制');
      }
    }
  }

  /**
   * 验证输入参数
   * 实现需求 5.3 - 验证文件夹ID有效性和用户访问权限
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @return {boolean} 验证结果
   */
  validateInputs(folderId, keyword) {
    // 验证文件夹ID
    if (!this.validateFolderId(folderId)) {
      console.log('文件夹ID验证失败');
      return false;
    }

    // 验证搜索关键词
    if (!this.validateKeyword(keyword)) {
      console.log('搜索关键词验证失败');
      return false;
    }

    return true;
  }

  /**
   * 验证文件夹ID格式和有效性
   * @param {string} folderId - 文件夹ID
   * @return {boolean} 验证结果
   */
  validateFolderId(folderId) {
    // 检查是否为空或undefined
    if (!folderId || typeof folderId !== 'string') {
      return false;
    }

    // 去除首尾空格
    folderId = folderId.trim();

    // 检查长度（Google Drive ID通常为28-44个字符）
    if (folderId.length < 20 || folderId.length > 50) {
      return false;
    }

    // 检查字符格式（只允许字母、数字、连字符和下划线）
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(folderId)) {
      return false;
    }

    return true;
  }

  /**
   * 验证搜索关键词
   * @param {string} keyword - 搜索关键词
   * @return {boolean} 验证结果
   */
  validateKeyword(keyword) {
    // 检查是否为空或undefined
    if (!keyword || typeof keyword !== 'string') {
      return false;
    }

    // 去除首尾空格
    keyword = keyword.trim();

    // 检查是否为空字符串
    if (keyword.length === 0) {
      return false;
    }

    // 检查长度限制（1-100个字符）
    if (keyword.length > 100) {
      return false;
    }

    // 检查是否只包含空白字符
    if (/^\s*$/.test(keyword)) {
      return false;
    }

    return true;
  }

  /**
   * 验证文件夹访问权限
   * 实现需求 5.3 - 确认文件夹ID有效且用户具有访问权限
   * @param {string} folderId - 文件夹ID
   * @return {boolean} 访问权限验证结果
   */
  validateFolderAccess(folderId) {
    try {
      // 尝试获取文件夹信息来验证访问权限
      const folder = DriveApp.getFolderById(folderId);
      
      // 检查文件夹是否存在且可访问
      if (!folder) {
        return false;
      }

      // 尝试获取文件夹名称来确认访问权限
      const folderName = folder.getName();
      if (!folderName) {
        return false;
      }

      console.log(`文件夹访问验证成功: ${folderName}`);
      return true;

    } catch (error) {
      console.log(`文件夹访问验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 初始化搜索配置
   * 实现需求 1.1 - 搜索初始化方法
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {string} outputFormat - 输出格式
   */
  initializeSearch(folderId, keyword, outputFormat) {
    // 创建搜索配置对象
    this.searchConfiguration = createSearchConfiguration(
      folderId.trim(),
      keyword.trim(),
      outputFormat
    );

    // 设置初始化标志
    this.isInitialized = true;

    console.log('搜索配置初始化完成');
    console.log(`- 文件夹ID: ${this.searchConfiguration.folderId}`);
    console.log(`- 搜索关键词: ${this.searchConfiguration.keyword}`);
    console.log(`- 输出格式: ${this.searchConfiguration.outputFormat}`);
    console.log(`- 支持文件类型: ${this.searchConfiguration.includeFileTypes.length} 种`);
  }

  /**
   * 获取当前搜索配置
   * @return {SearchConfiguration|null} 搜索配置对象
   */
  getSearchConfiguration() {
    return this.searchConfiguration;
  }

  /**
   * 检查是否已初始化
   * @return {boolean} 初始化状态
   */
  isSearchInitialized() {
    return this.isInitialized;
  }

  /**
   * 获取性能监控器
   * @return {PerformanceMonitor} 性能监控器实例
   */
  getPerformanceMonitor() {
    return this.performanceMonitor;
  }

  /**
   * 获取增量搜索管理器
   * @return {IncrementalSearchManager} 增量搜索管理器实例
   */
  getIncrementalSearchManager() {
    return this.incrementalSearchManager;
  }

  /**
   * 检查是否接近超时
   * @return {boolean} 是否接近超时
   */
  isNearTimeout() {
    return this.performanceMonitor.isNearTimeout();
  }

  /**
   * 检查是否已超时
   * @return {boolean} 是否已超时
   */
  isTimeout() {
    return this.performanceMonitor.isTimeout();
  }

  /**
   * 执行增量搜索
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {string} outputFormat - 输出格式
   * @param {Object} savedProgress - 保存的进度（可选）
   * @return {Object} 搜索结果和进度信息
   */
  performIncrementalSearch(folderId, keyword, outputFormat = 'logger', savedProgress = null) {
    // 开始性能监控
    this.performanceMonitor.startMonitoring();
    this.performanceMonitor.addCheckpoint('增量搜索开始');

    try {
      // 如果有保存的进度，尝试恢复
      if (savedProgress) {
        const restored = this.incrementalSearchManager.restoreProgress(savedProgress);
        if (!restored) {
          throw new Error('无法恢复搜索进度');
        }
        this.performanceMonitor.addCheckpoint('搜索进度已恢复');
      } else {
        // 验证输入参数
        if (!this.validateInputs(folderId, keyword)) {
          throw new Error('输入验证失败：请提供有效的文件夹ID和搜索关键词');
        }

        // 验证文件夹访问权限
        if (!this.validateFolderAccess(folderId)) {
          throw new Error('文件夹访问验证失败：无法访问指定的文件夹或文件夹不存在');
        }

        // 初始化搜索配置
        this.initializeSearch(folderId, keyword, outputFormat);
        this.performanceMonitor.addCheckpoint('搜索配置初始化完成');

        // 估算文件数量（这里使用模拟值，实际实现中需要遍历文件夹）
        const estimatedFileCount = this.estimateFileCount(folderId);
        
        // 初始化增量搜索进度
        this.incrementalSearchManager.initializeSearchProgress(folderId, keyword, estimatedFileCount);
        this.performanceMonitor.addCheckpoint('增量搜索进度初始化完成');
      }

      // 模拟搜索过程（实际实现中会调用其他组件）
      const results = this.simulateIncrementalSearchProcess();
      
      // 获取最终统计信息
      const stats = this.incrementalSearchManager.getSearchStats();
      
      this.performanceMonitor.addCheckpoint('增量搜索完成', { 
        resultCount: results.length,
        isComplete: stats.isComplete 
      });

      return {
        results: results,
        stats: stats,
        progress: this.incrementalSearchManager.getCurrentProgress(),
        isComplete: stats.isComplete,
        canContinue: !stats.isComplete && !this.performanceMonitor.isTimeout()
      };

    } finally {
      // 输出性能统计
      const totalTime = this.performanceMonitor.stopMonitoring();
      const perfStats = this.performanceMonitor.getPerformanceStats();
      
      console.log('=== 增量搜索性能统计 ===');
      console.log(`总执行时间: ${perfStats.formattedElapsed}`);
      console.log(`剩余时间: ${perfStats.formattedRemaining}`);
      
      if (perfStats.isNearTimeout) {
        console.warn('警告: 执行时间接近限制，建议保存进度后继续');
      }
    }
  }

  /**
   * 估算文件夹中的文件数量
   * @param {string} folderId - 文件夹ID
   * @return {number} 估算的文件数量
   */
  estimateFileCount(folderId) {
    // 这是一个简化的实现，实际中需要遍历文件夹
    // 这里返回一个模拟值用于演示
    return Math.floor(Math.random() * 2000) + 500; // 500-2500之间的随机数
  }

  /**
   * 模拟增量搜索过程
   * @return {Array} 搜索结果
   */
  simulateIncrementalSearchProcess() {
    const results = [];
    const progress = this.incrementalSearchManager.getCurrentProgress();
    
    if (!progress) {
      return results;
    }

    // 模拟分批处理
    while (!this.incrementalSearchManager.isSearchComplete(progress.totalFiles) && 
           !this.performanceMonitor.isTimeout()) {
      
      // 模拟获取一批文件
      const batchFiles = this.generateMockFileBatch();
      
      // 模拟搜索这批文件
      const batchResults = this.simulateBatchSearch(batchFiles, progress.keyword);
      
      // 处理批次结果
      const canContinue = this.incrementalSearchManager.processBatchResults(
        batchResults, 
        batchFiles.length
      );
      
      results.push(...batchResults);
      
      // 如果建议停止（接近超时），则保存进度并退出
      if (!canContinue) {
        console.log('接近超时限制，停止当前搜索');
        break;
      }
      
      // 添加性能检查点
      this.performanceMonitor.addCheckpoint(`完成批次 ${progress.currentBatch}`, {
        batchResults: batchResults.length,
        totalResults: results.length
      });
    }

    return results;
  }

  /**
   * 生成模拟文件批次
   * @return {Array} 模拟文件数组
   */
  generateMockFileBatch() {
    const batchSize = this.incrementalSearchManager.batchSize;
    const files = [];
    
    for (let i = 0; i < batchSize; i++) {
      files.push({
        id: `file_${Date.now()}_${i}`,
        name: `document_${i}.txt`,
        type: 'text/plain'
      });
    }
    
    return files;
  }

  /**
   * 模拟批次搜索
   * @param {Array} files - 文件数组
   * @param {string} keyword - 搜索关键词
   * @return {Array} 匹配的搜索结果
   */
  simulateBatchSearch(files, keyword) {
    const results = [];
    
    // 模拟30%的文件匹配关键词
    files.forEach((file, index) => {
      if (Math.random() < 0.3) {
        results.push({
          fileName: file.name,
          fileUrl: `https://drive.google.com/file/d/${file.id}`,
          folderPath: '/test/folder/path',
          fileType: file.type,
          lastModified: new Date()
        });
      }
    });
    
    return results;
  }

  /**
   * 保存当前搜索进度
   * @return {Object|null} 搜索进度快照
   */
  saveSearchProgress() {
    return this.incrementalSearchManager.saveProgress();
  }

  /**
   * 重置搜索控制器状态
   */
  reset() {
    this.isInitialized = false;
    this.searchConfiguration = null;
    this.performanceMonitor.reset();
    this.incrementalSearchManager.reset();
    console.log('搜索控制器已重置');
  }
}

/**
 * 创建SearchController实例的工厂函数
 * @return {SearchController} SearchController实例
 */
function createSearchController() {
  return new SearchController();
}