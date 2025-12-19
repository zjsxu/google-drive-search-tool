/**
 * 性能监控器类
 * 负责执行时间跟踪和超时检测
 * 实现需求 4.1 - 在Google Apps Script执行时间限制内完成搜索操作
 */

/**
 * PerformanceMonitor - 性能监控核心类
 */
class PerformanceMonitor {
  constructor() {
    this.startTime = null;
    this.maxExecutionTime = 5.5 * 60 * 1000; // 5.5分钟，留0.5分钟缓冲
    this.warningThreshold = 4.5 * 60 * 1000; // 4.5分钟时发出警告
    this.checkpoints = [];
    this.isMonitoring = false;
  }

  /**
   * 开始监控执行时间
   */
  startMonitoring() {
    this.startTime = new Date().getTime();
    this.isMonitoring = true;
    this.checkpoints = [];
    console.log('性能监控已启动');
  }

  /**
   * 停止监控
   * @return {number} 总执行时间（毫秒）
   */
  stopMonitoring() {
    if (!this.isMonitoring || !this.startTime) {
      return 0;
    }

    const totalTime = this.getElapsedTime();
    this.isMonitoring = false;
    console.log(`性能监控已停止，总执行时间: ${this.formatTime(totalTime)}`);
    return totalTime;
  }

  /**
   * 获取已执行时间
   * @return {number} 已执行时间（毫秒）
   */
  getElapsedTime() {
    if (!this.startTime) {
      return 0;
    }
    return new Date().getTime() - this.startTime;
  }

  /**
   * 获取剩余执行时间
   * @return {number} 剩余时间（毫秒）
   */
  getRemainingTime() {
    const elapsed = this.getElapsedTime();
    return Math.max(0, this.maxExecutionTime - elapsed);
  }

  /**
   * 检查是否接近超时限制
   * @return {boolean} 是否接近超时
   */
  isNearTimeout() {
    const elapsed = this.getElapsedTime();
    return elapsed >= this.warningThreshold;
  }

  /**
   * 检查是否已超时
   * @return {boolean} 是否已超时
   */
  isTimeout() {
    const elapsed = this.getElapsedTime();
    return elapsed >= this.maxExecutionTime;
  }

  /**
   * 添加检查点
   * @param {string} description - 检查点描述
   * @param {Object} metadata - 附加元数据
   */
  addCheckpoint(description, metadata = {}) {
    if (!this.isMonitoring) {
      return;
    }

    const checkpoint = {
      timestamp: new Date().getTime(),
      elapsedTime: this.getElapsedTime(),
      description: description,
      metadata: metadata
    };

    this.checkpoints.push(checkpoint);
    console.log(`检查点: ${description} - 已执行: ${this.formatTime(checkpoint.elapsedTime)}`);

    // 检查是否接近超时
    if (this.isNearTimeout()) {
      console.warn(`警告: 接近执行时间限制，剩余时间: ${this.formatTime(this.getRemainingTime())}`);
    }
  }

  /**
   * 获取性能统计信息
   * @return {Object} 性能统计
   */
  getPerformanceStats() {
    const elapsed = this.getElapsedTime();
    const remaining = this.getRemainingTime();
    
    return {
      startTime: this.startTime,
      elapsedTime: elapsed,
      remainingTime: remaining,
      isNearTimeout: this.isNearTimeout(),
      isTimeout: this.isTimeout(),
      checkpointCount: this.checkpoints.length,
      formattedElapsed: this.formatTime(elapsed),
      formattedRemaining: this.formatTime(remaining)
    };
  }

  /**
   * 获取所有检查点
   * @return {Array} 检查点数组
   */
  getCheckpoints() {
    return [...this.checkpoints];
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
   * 重置监控器
   */
  reset() {
    this.startTime = null;
    this.isMonitoring = false;
    this.checkpoints = [];
    console.log('性能监控器已重置');
  }

  /**
   * 设置自定义超时限制
   * @param {number} timeoutMs - 超时时间（毫秒）
   * @param {number} warningMs - 警告时间（毫秒）
   */
  setTimeoutLimits(timeoutMs, warningMs) {
    this.maxExecutionTime = timeoutMs;
    this.warningThreshold = warningMs || timeoutMs * 0.8;
    console.log(`超时限制已设置: ${this.formatTime(timeoutMs)}, 警告阈值: ${this.formatTime(this.warningThreshold)}`);
  }
}

/**
 * 创建PerformanceMonitor实例的工厂函数
 * @return {PerformanceMonitor} PerformanceMonitor实例
 */
function createPerformanceMonitor() {
  return new PerformanceMonitor();
}

/**
 * 全局性能监控器实例
 */
let globalPerformanceMonitor = null;

/**
 * 获取全局性能监控器实例
 * @return {PerformanceMonitor} 全局监控器实例
 */
function getGlobalPerformanceMonitor() {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = createPerformanceMonitor();
  }
  return globalPerformanceMonitor;
}