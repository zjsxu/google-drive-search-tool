/**
 * 基础测试框架
 * 为Google Apps Script环境提供简单的测试功能
 */

/**
 * 测试套件类
 */
class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  /**
   * 添加测试用例
   * @param {string} testName - 测试名称
   * @param {Function} testFunction - 测试函数
   */
  addTest(testName, testFunction) {
    this.tests.push({
      name: testName,
      fn: testFunction
    });
  }

  /**
   * 运行所有测试
   */
  run() {
    console.log(`\n=== 运行测试套件: ${this.name} ===`);
    
    this.tests.forEach(test => {
      try {
        test.fn();
        this.results.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        console.log(`✗ ${test.name}: ${error.message}`);
      }
      this.results.total++;
    });

    this.printSummary();
  }

  /**
   * 打印测试结果摘要
   */
  printSummary() {
    console.log(`\n=== 测试结果摘要 ===`);
    console.log(`总计: ${this.results.total}`);
    console.log(`通过: ${this.results.passed}`);
    console.log(`失败: ${this.results.failed}`);
    console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
  }
}

/**
 * 断言函数
 */
const Assert = {
  /**
   * 断言两个值相等
   * @param {*} actual - 实际值
   * @param {*} expected - 期望值
   * @param {string} message - 错误消息
   */
  assertEquals: function(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`断言失败: 期望 ${expected}, 实际 ${actual}. ${message}`);
    }
  },

  /**
   * 断言值为真
   * @param {*} value - 要检查的值
   * @param {string} message - 错误消息
   */
  assertTrue: function(value, message = '') {
    if (!value) {
      throw new Error(`断言失败: 期望为真, 实际为假. ${message}`);
    }
  },

  /**
   * 断言值为假
   * @param {*} value - 要检查的值
   * @param {string} message - 错误消息
   */
  assertFalse: function(value, message = '') {
    if (value) {
      throw new Error(`断言失败: 期望为假, 实际为真. ${message}`);
    }
  },

  /**
   * 断言值不为null或undefined
   * @param {*} value - 要检查的值
   * @param {string} message - 错误消息
   */
  assertNotNull: function(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(`断言失败: 值不应为null或undefined. ${message}`);
    }
  },

  /**
   * 断言抛出异常
   * @param {Function} fn - 应该抛出异常的函数
   * @param {string} message - 错误消息
   */
  assertThrows: function(fn, message = '') {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(`断言失败: 期望抛出异常但没有抛出. ${message}`);
    }
  }
};

/**
 * 属性测试生成器
 * 用于基于属性的测试
 */
class PropertyTestGenerator {
  /**
   * 生成随机字符串
   * @param {number} minLength - 最小长度
   * @param {number} maxLength - 最大长度
   * @return {string} 随机字符串
   */
  static randomString(minLength = 1, maxLength = 20) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机文件夹ID格式的字符串
   * @return {string} 模拟的文件夹ID
   */
  static randomFolderId() {
    // Google Drive文件夹ID通常是33个字符的字母数字字符串
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 33; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成有效的随机文件夹ID（用于属性测试）
   * 这个方法生成格式正确但可能不存在的文件夹ID
   * @return {string} 有效格式的文件夹ID
   */
  static randomValidFolderId() {
    // 使用更严格的字符集，只包含字母和数字
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    // Google Drive ID长度通常在28-44个字符之间
    const length = Math.floor(Math.random() * 17) + 28; // 28-44
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机搜索关键词
   * @return {string} 搜索关键词
   */
  static randomKeyword() {
    const keywords = ['测试', 'document', 'report', '项目', 'data', '分析', 'meeting', '会议'];
    return keywords[Math.floor(Math.random() * keywords.length)];
  }

  /**
   * 生成用于测试的随机文件夹ID（包括有效和无效格式）
   * @return {Object} 包含id和shouldBeValid标志的对象
   */
  static randomTestFolderId() {
    const random = Math.random();
    
    if (random < 0.7) {
      // 70% 概率生成有效格式的ID
      return {
        id: this.randomValidFolderId(),
        shouldBeValid: true
      };
    } else {
      // 30% 概率生成无效格式的ID
      const invalidTypes = [
        () => '', // 空字符串
        () => '   ', // 只有空格
        () => 'abc', // 太短
        () => 'a'.repeat(60), // 太长
        () => 'invalid@id#with$special%chars', // 包含特殊字符
        () => null, // null值
        () => undefined, // undefined值
        () => 'folder-id-with-spaces in-middle', // 包含空格
        () => '中文文件夹ID', // 包含中文字符
        () => 'id.with.dots.and@symbols!' // 包含点和其他符号
      ];
      
      const randomInvalidGenerator = invalidTypes[Math.floor(Math.random() * invalidTypes.length)];
      return {
        id: randomInvalidGenerator(),
        shouldBeValid: false
      };
    }
  }

  /**
   * 运行属性测试
   * @param {string} propertyName - 属性名称
   * @param {Function} propertyFunction - 属性测试函数
   * @param {number} iterations - 迭代次数
   */
  static runPropertyTest(propertyName, propertyFunction, iterations = 100) {
    console.log(`\n=== 运行属性测试: ${propertyName} ===`);
    let passed = 0;
    let failed = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        propertyFunction();
        passed++;
      } catch (error) {
        failed++;
        console.log(`迭代 ${i + 1} 失败: ${error.message}`);
        // 对于属性测试，我们记录第一个失败就停止
        if (failed === 1) {
          console.log(`属性测试失败，反例在迭代 ${i + 1}`);
          throw error;
        }
      }
    }

    console.log(`属性测试完成: ${passed}/${iterations} 通过`);
  }
}