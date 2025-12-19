/**
 * 增量搜索管理器类
 * 负责处理大量文件的分批搜索和进度保存
 * 实现需求 4.2 - 采用增量搜索策略避免超时
 */

/**
 * IncrementalSearchManager - 增量搜索管理核心类
 */
class IncrementalSearchManager {
  constructor() {
    this.fileCountThreshold = 1000; // 文件数量阈值
    this.batchSize = 100; // 每批处理的文件数量
    this.searchProgress = null;
    this.isIncrementalMode = false;
    this.performanceMonitor = null;
  }

  /**
   * 设置性能监控器
   * @param {PerformanceMonitor} monitor - 性能监控器实例
   */
  setPerformanceMonitor(monitor) {
    this.performanceMonitor = monitor;
  }

  /**
   * 检查是否需要增量搜索
   * @param {number} estimatedFileCount - 预估文件数量
   * @return {boolean} 是否需要增量搜索
   */
  shouldUseIncrementalSearch(estimatedFileCount) {
    return estimatedFileCount > this.fileCountThreshold;
  }

  /**
   * 初始化搜索进度
   * @param {string} folderId - 文件夹ID
   * @param {string} keyword - 搜索关键词
   * @param {number} totalFiles - 总文件数量
   */
  initializeSearchProgress(folderId, keyword, totalFiles) {
    this.searchProgress = {
      folderId: folderId,
      keyword: keyword,
      totalFiles: totalFiles,
      processedFiles: 0,
      currentBatch: 0,
      results: [],
      processedFolders: [],
      remainingFolders: [],
      startTime: new Date().getTime(),
      lastCheckpoint: new Date().getTime(),
      isComplete: false
    };

    this.isIncrementalMode = this.shouldUseIncrementalSearch(totalFiles);
    
    console.log(`增量搜索初始化完成:`);
    console.log(`- 总文件数: ${totalFiles}`);
    console.log(`- 增量模式: ${this.isIncrementalMode ? '启用' : '禁用'}`);
    console.log(`- 批处理大小: ${this.batchSize}`);
  }

  /**
   * 获取下一批要处理的文件
   * @param {Array} allFiles - 所有文件列表
   * @return {Array} 下一批文件
   */
  getNextBatch(allFiles) {
    if (!this.searchProgress) {
      throw new Error('搜索进度未初始化');
    }

    const startIndex = this.searchProgress.currentBatch * this.batchSize;
    const endIndex = Math.min(startIndex + this.batchSize, allFiles.length);
    
    const batch = allFiles.slice(startIndex, endIndex);
    
    console.log(`获取批次 ${this.searchProgress.currentBatch + 1}: ${startIndex}-${endIndex-1} (${batch.length} 个文件)`);
    
    return batch;
  }

  /**
   * 处理批次结果
   * @param {Array} batchResults - 批次搜索结果
   * @param {number} processedCount - 已处理文件数量
   */
  processBatchResults(batchResults, processedCount) {
    if (!this.searchProgress) {
      throw new Error('搜索进度未初始化');
    }

    // 合并结果
    this.searchProgress.results = this.searchProgress.results.concat(batchResults);
    this.searchProgress.processedFiles += processedCount;
    this.searchProgress.currentBatch++;
    this.searchProgress.lastCheckpoint = new Date().getTime();

    // 计算进度
    const progress = (this.searchProgress.processedFiles / this.searchProgress.totalFiles * 100).toFixed(2);
    
    console.log(`批次处理完成:`);
    console.log(`- 本批次结果: ${batchResults.length} 个匹配`);
    console.log(`- 已处理文件: ${this.searchProgress.processedFiles}/${this.searchProgress.totalFiles}`);
    console.log(`- 进度: ${progress}%`);
    console.log(`- 累计结果: ${this.searchProgress.results.length} 个匹配`);

    // 检查是否接近超时
    if (this.performanceMonitor && this.performanceMonitor.isNearTimeout()) {
      console.warn('警告: 接近执行时间限制，建议保存当前进度');
      return false; // 建议停止当前执行
    }

    return true; // 可以继续处理
  }

  /**
   * 检查是否完成搜索
   * @param {number} totalFiles - 总文件数量
   * @return {boolean} 是否完成
   */
  isSearchComplete(totalFiles) {
    if (!this.searchProgress) {
      return false;
    }

    const isComplete = this.searchProgress.processedFiles >= totalFiles;
    
    if (isComplete) {
      this.searchProgress.isComplete = true;
      const totalTime = new Date().getTime() - this.searchProgress.startTime;
      console.log(`搜索完成! 总耗时: ${this.formatTime(totalTime)}`);
    }

    return isComplete;
  }

  /**
   * 保存搜索进度
   * @return {Object} 搜索进度快照
   */
  saveProgress() {
    if (!this.searchProgress) {
      return null;
    }

    const progressSnapshot = {
      ...this.searchProgress,
      savedAt: new Date().getTime()
    };

    console.log('搜索进度已保存');
    console.log(`- 已处理: ${progressSnapshot.processedFiles}/${progressSnapshot.totalFiles} 文件`);
    console.log(`- 当前批次: ${progressSnapshot.currentBatch}`);
    console.log(`- 累计结果: ${progressSnapshot.results.length} 个匹配`);

    return progressSnapshot;
  }

  /**
   * 恢复搜索进度
   * @param {Object} savedProgress - 保存的进度数据
   * @return {boolean} 是否成功恢复
   */
  restoreProgress(savedProgress) {
    if (!savedProgress || typeof savedProgress !== 'object') {
      console.log('无效的进度数据，无法恢复');
      return false;
    }

    this.searchProgress = {
      ...savedProgress,
      restoredAt: new Date().getTime()
    };

    this.isIncrementalMode = this.shouldUseIncrementalSearch(this.searchProgress.totalFiles);

    console.log('搜索进度已恢复');
    console.log(`- 文件夹ID: ${this.searchProgress.folderId}`);
    console.log(`- 搜索关键词: ${this.searchProgress.keyword}`);
    console.log(`- 已处理: ${this.searchProgress.processedFiles}/${this.searchProgress.totalFiles} 文件`);
    console.log(`- 当前批次: ${this.searchProgress.currentBatch}`);
    console.log(`- 累计结果: ${this.searchProgress.results.length} 个匹配`);

    return true;
  }

  /**
   * 获取搜索统计信息
   * @return {Object} 统计信息
   */
  getSearchStats() {
    if (!this.searchProgress) {
      return null;
    }

    const currentTime = new Date().getTime();
    const totalElapsed = currentTime - this.searchProgress.startTime;
    const progress = (this.searchProgress.processedFiles / this.searchProgress.totalFiles * 100);
    
    // 估算剩余时间
    const avgTimePerFile = totalElapsed / Math.max(1, this.searchProgress.processedFiles);
    const remainingFiles = this.searchProgress.totalFiles - this.searchProgress.processedFiles;
    const estimatedRemainingTime = avgTimePerFile * remainingFiles;

    return {
      totalFiles: this.searchProgress.totalFiles,
      processedFiles: this.searchProgress.processedFiles,
      remainingFiles: remainingFiles,
      currentBatch: this.searchProgress.currentBatch,
      totalResults: this.searchProgress.results.length,
      progress: progress,
      totalElapsed: totalElapsed,
      estimatedRemainingTime: estimatedRemainingTime,
      avgTimePerFile: avgTimePerFile,
      isIncrementalMode: this.isIncrementalMode,
      isComplete: this.searchProgress.isComplete,
      formattedProgress: `${progress.toFixed(2)}%`,
      formattedElapsed: this.formatTime(totalElapsed),
      formattedEstimatedRemaining: this.formatTime(estimatedRemainingTime)
    };
  }

  /**
   * 重置增量搜索管理器
   */
  reset() {
    this.searchProgress = null;
    this.isIncrementalMode = false;
    console.log('增量搜索管理器已重置');
  }

  /**
   * 设置配置参数
   * @param {Object} config - 配置对象
   */
  setConfiguration(config) {
    if (config.fileCountThreshold) {
      this.fileCountThreshold = config.fileCountThreshold;
    }
    if (config.batchSize) {
      this.batchSize = config.batchSize;
    }

    console.log(`增量搜索配置已更新:`);
    console.log(`- 文件数量阈值: ${this.fileCountThreshold}`);
    console.log(`- 批处理大小: ${this.batchSize}`);
  }

  /**
   * 格式化时间显示
   * @param {number} milliseconds - 毫秒数
   * @return {string} 格式化的时间字符串
   */
  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    } else {
      return `${remainingSeconds}秒`;
    }
  }

  /**
   * 获取当前搜索进度
   * @return {Object|null} 当前进度对象
   */
  getCurrentProgress() {
    return this.searchProgress;
  }

  /**
   * 检查是否处于增量模式
   * @return {boolean} 是否增量模式
   */
  isInIncrementalMode() {
    return this.isIncrementalMode;
  }
}

/**
 * 创建IncrementalSearchManager实例的工厂函数
 * @return {IncrementalSearchManager} IncrementalSearchManager实例
 */
function createIncrementalSearchManager() {
  return new IncrementalSearchManager();
}