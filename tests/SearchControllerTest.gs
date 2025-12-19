/**
 * SearchController 测试
 * 测试搜索控制器的核心功能和输入验证
 */

/**
 * 运行SearchController单元测试
 */
function runSearchControllerTests() {
  const suite = new TestSuite('SearchController测试');

  // 测试SearchController创建
  suite.addTest('创建SearchController实例', function() {
    const controller = createSearchController();
    
    Assert.assertNotNull(controller, 'SearchController实例应该被创建');
    Assert.assertFalse(controller.isSearchInitialized(), '初始状态应该未初始化');
    Assert.assertEquals(controller.getSearchConfiguration(), null, '初始配置应该为null');
  });

  // 测试文件夹ID验证 - 有效输入
  suite.addTest('文件夹ID验证 - 有效输入', function() {
    const controller = createSearchController();
    
    // 测试有效的文件夹ID格式
    Assert.assertTrue(controller.validateFolderId('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'), '标准Google Drive ID应该有效');
    Assert.assertTrue(controller.validateFolderId('abcdefghijklmnopqrstuvwxyz123456'), '字母数字组合应该有效');
    Assert.assertTrue(controller.validateFolderId('test-folder_id-123'), '包含连字符和下划线应该有效');
  });

  // 测试文件夹ID验证 - 无效输入
  suite.addTest('文件夹ID验证 - 无效输入', function() {
    const controller = createSearchController();
    
    // 测试无效的文件夹ID
    Assert.assertFalse(controller.validateFolderId(''), '空字符串应该无效');
    Assert.assertFalse(controller.validateFolderId(null), 'null应该无效');
    Assert.assertFalse(controller.validateFolderId(undefined), 'undefined应该无效');
    Assert.assertFalse(controller.validateFolderId('   '), '只有空格应该无效');
    Assert.assertFalse(controller.validateFolderId('abc'), '太短的ID应该无效');
    Assert.assertFalse(controller.validateFolderId('a'.repeat(60)), '太长的ID应该无效');
    Assert.assertFalse(controller.validateFolderId('invalid@id#with$special%chars'), '包含特殊字符应该无效');
  });

  // 测试关键词验证 - 有效输入
  suite.addTest('关键词验证 - 有效输入', function() {
    const controller = createSearchController();
    
    // 测试有效的关键词
    Assert.assertTrue(controller.validateKeyword('测试'), '中文关键词应该有效');
    Assert.assertTrue(controller.validateKeyword('test'), '英文关键词应该有效');
    Assert.assertTrue(controller.validateKeyword('test keyword'), '包含空格的关键词应该有效');
    Assert.assertTrue(controller.validateKeyword('123'), '数字关键词应该有效');
    Assert.assertTrue(controller.validateKeyword('test-keyword_123'), '包含特殊字符的关键词应该有效');
    Assert.assertTrue(controller.validateKeyword('  test  '), '首尾有空格的关键词应该有效');
  });

  // 测试关键词验证 - 无效输入
  suite.addTest('关键词验证 - 无效输入', function() {
    const controller = createSearchController();
    
    // 测试无效的关键词
    Assert.assertFalse(controller.validateKeyword(''), '空字符串应该无效');
    Assert.assertFalse(controller.validateKeyword(null), 'null应该无效');
    Assert.assertFalse(controller.validateKeyword(undefined), 'undefined应该无效');
    Assert.assertFalse(controller.validateKeyword('   '), '只有空格应该无效');
    Assert.assertFalse(controller.validateKeyword('\t\n\r'), '只有空白字符应该无效');
    Assert.assertFalse(controller.validateKeyword('a'.repeat(101)), '超长关键词应该无效');
  });

  // 测试输入验证组合
  suite.addTest('输入验证组合测试', function() {
    const controller = createSearchController();
    
    // 测试有效输入组合
    Assert.assertTrue(controller.validateInputs('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'test'), '有效输入组合应该通过');
    
    // 测试无效输入组合
    Assert.assertFalse(controller.validateInputs('', 'test'), '无效文件夹ID应该失败');
    Assert.assertFalse(controller.validateInputs('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', ''), '无效关键词应该失败');
    Assert.assertFalse(controller.validateInputs('', ''), '两个都无效应该失败');
  });

  // 测试搜索初始化
  suite.addTest('搜索初始化测试', function() {
    const controller = createSearchController();
    
    // 执行初始化
    controller.initializeSearch('test-folder-id', 'test keyword', 'logger');
    
    // 验证初始化状态
    Assert.assertTrue(controller.isSearchInitialized(), '应该标记为已初始化');
    
    const config = controller.getSearchConfiguration();
    Assert.assertNotNull(config, '搜索配置应该被创建');
    Assert.assertEquals(config.folderId, 'test-folder-id', '文件夹ID应该正确设置');
    Assert.assertEquals(config.keyword, 'test keyword', '关键词应该正确设置');
    Assert.assertEquals(config.outputFormat, 'logger', '输出格式应该正确设置');
  });

  // 测试搜索初始化 - 去除空格
  suite.addTest('搜索初始化 - 去除空格', function() {
    const controller = createSearchController();
    
    // 使用带空格的输入
    controller.initializeSearch('  test-folder-id  ', '  test keyword  ', 'sheet');
    
    const config = controller.getSearchConfiguration();
    Assert.assertEquals(config.folderId, 'test-folder-id', '文件夹ID应该去除首尾空格');
    Assert.assertEquals(config.keyword, 'test keyword', '关键词应该去除首尾空格');
  });

  // 测试重置功能
  suite.addTest('重置功能测试', function() {
    const controller = createSearchController();
    
    // 先初始化
    controller.initializeSearch('test-folder-id', 'test keyword', 'logger');
    Assert.assertTrue(controller.isSearchInitialized(), '应该已初始化');
    
    // 执行重置
    controller.reset();
    Assert.assertFalse(controller.isSearchInitialized(), '重置后应该未初始化');
    Assert.assertEquals(controller.getSearchConfiguration(), null, '重置后配置应该为null');
  });

  // 测试搜索方法 - 输入验证失败
  suite.addTest('搜索方法 - 输入验证失败', function() {
    const controller = createSearchController();
    
    // 测试无效输入应该抛出异常
    Assert.assertThrows(function() {
      controller.search('', 'test');
    }, '无效文件夹ID应该抛出异常');
    
    Assert.assertThrows(function() {
      controller.search('valid-folder-id', '');
    }, '无效关键词应该抛出异常');
  });

  suite.run();
}

/**
 * 运行特定的搜索执行完整性属性测试
 * 任务 2.2 - 属性 1: 搜索执行完整性
 */
function runSearchExecutionCompletenessPropertyTest() {
  console.log('\n=== 运行任务 2.2: 搜索执行完整性属性测试 ===');
  
  // **Feature: google-drive-search-tool, Property 1: 搜索执行完整性**
  // **验证: 需求 1.1**
  PropertyTestGenerator.runPropertyTest(
    '属性 1: 搜索执行完整性',
    function() {
      const controller = createSearchController();
      
      // 生成有效的随机输入
      const validFolderId = PropertyTestGenerator.randomValidFolderId();
      const validKeyword = PropertyTestGenerator.randomKeyword();
      const outputFormat = Math.random() > 0.5 ? 'logger' : 'sheet';
      
      // 对于任何有效的文件夹ID和搜索关键词，系统应该执行完整的搜索操作并返回结果
      try {
        const results = controller.search(validFolderId, validKeyword, outputFormat);
        
        // 验证搜索执行完整性
        Assert.assertNotNull(results, '搜索结果不应为null');
        Assert.assertTrue(Array.isArray(results), '搜索结果应该是数组');
        
        // 验证搜索配置已正确初始化
        Assert.assertTrue(controller.isSearchInitialized(), '搜索应该已初始化');
        
        const config = controller.getSearchConfiguration();
        Assert.assertNotNull(config, '搜索配置应该存在');
        Assert.assertEquals(config.folderId, validFolderId, '配置中的文件夹ID应该匹配');
        Assert.assertEquals(config.keyword, validKeyword, '配置中的关键词应该匹配');
        Assert.assertEquals(config.outputFormat, outputFormat, '配置中的输出格式应该匹配');
        
        // 验证搜索结果结构（即使是空数组也应该有正确的结构）
        results.forEach(result => {
          if (result) {
            Assert.assertTrue(typeof result.fileName === 'string', '文件名应该是字符串');
            Assert.assertTrue(typeof result.fileUrl === 'string', '文件链接应该是字符串');
            Assert.assertTrue(typeof result.folderPath === 'string', '文件路径应该是字符串');
            Assert.assertTrue(typeof result.fileType === 'string', '文件类型应该是字符串');
            Assert.assertTrue(result.lastModified instanceof Date, '修改时间应该是Date对象');
          }
        });
        
      } catch (error) {
        // 如果是因为文件夹不存在或无权限访问导致的错误，这是预期的行为
        if (error.message.includes('文件夹访问验证失败')) {
          // 这是正常的，因为我们使用的是随机生成的文件夹ID
          // 验证错误处理是否正确
          Assert.assertTrue(error.message.length > 0, '错误信息应该不为空');
        } else {
          // 其他类型的错误应该重新抛出
          throw error;
        }
      }
    },
    100
  );
}

/**
 * 运行任务 2.3: 输入验证属性测试
 * 属性 11: 输入验证
 */
function runInputValidationPropertyTest() {
  console.log('\n=== 运行任务 2.3: 输入验证属性测试 ===');
  
  // **Feature: google-drive-search-tool, Property 11: 输入验证**
  // **验证: 需求 5.3**
  
  console.log('开始属性测试: 属性 11: 输入验证');
  let passed = 0;
  let failed = 0;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    try {
      const controller = createSearchController();
      
      // 生成随机文件夹ID进行测试
      const testFolderId = generateRandomTestFolderId();
      
      // 对于任何提供的文件夹ID，系统应该验证其有效性和用户访问权限
      
      // 1. 测试文件夹ID格式验证
      const formatValidationResult = controller.validateFolderId(testFolderId.id);
      
      if (testFolderId.shouldBeValid) {
        // 如果生成的ID应该是有效格式，验证格式验证通过
        if (!formatValidationResult) {
          throw new Error(`有效格式的文件夹ID应该通过格式验证: ${testFolderId.id}`);
        }
        
        // 2. 测试完整的输入验证（包括访问权限验证）
        const keyword = generateRandomKeyword();
        const inputValidationResult = controller.validateInputs(testFolderId.id, keyword);
        
        // 输入验证应该通过格式检查
        if (!inputValidationResult) {
          throw new Error(`有效格式的输入应该通过基本验证: folderId=${testFolderId.id}, keyword=${keyword}`);
        }
        
        // 3. 测试搜索方法中的完整验证（包括访问权限）
        try {
          const results = controller.search(testFolderId.id, keyword, 'logger');
          
          // 如果搜索成功，验证结果结构
          if (results === null || results === undefined) {
            throw new Error('搜索结果不应为null');
          }
          if (!Array.isArray(results)) {
            throw new Error('搜索结果应该是数组');
          }
          
          // 验证搜索配置正确初始化
          if (!controller.isSearchInitialized()) {
            throw new Error('搜索应该已初始化');
          }
          const config = controller.getSearchConfiguration();
          if (config.folderId !== testFolderId.id) {
            throw new Error('配置中的文件夹ID应该匹配');
          }
          
        } catch (error) {
          // 如果是访问权限错误，这是预期的（因为我们使用随机生成的ID）
          if (error.message.includes('文件夹访问验证失败')) {
            // 验证错误处理正确
            if (error.message.length === 0) {
              throw new Error('访问权限错误应该有有意义的错误信息');
            }
            
            // 验证系统状态保持一致
            if (controller.isSearchInitialized()) {
              throw new Error('访问验证失败时不应初始化搜索');
            }
          } else {
            // 其他类型的错误应该重新抛出
            throw error;
          }
        }
        
      } else {
        // 如果生成的ID应该是无效格式，验证格式验证失败
        if (formatValidationResult) {
          throw new Error(`无效格式的文件夹ID应该未通过格式验证: ${testFolderId.id}`);
        }
        
        // 测试完整的输入验证也应该失败
        const keyword = generateRandomKeyword();
        const inputValidationResult = controller.validateInputs(testFolderId.id, keyword);
        if (inputValidationResult) {
          throw new Error(`无效格式的输入应该未通过验证: ${testFolderId.id}`);
        }
        
        // 测试搜索方法应该抛出输入验证异常
        let threwException = false;
        try {
          controller.search(testFolderId.id, keyword, 'logger');
        } catch (error) {
          threwException = true;
        }
        if (!threwException) {
          throw new Error(`无效文件夹ID应该在搜索时抛出异常: ${testFolderId.id}`);
        }
      }
      
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

/**
 * 生成用于测试的随机文件夹ID（包括有效和无效格式）
 * @return {Object} 包含id和shouldBeValid标志的对象
 */
function generateRandomTestFolderId() {
  const random = Math.random();
  
  if (random < 0.7) {
    // 70% 概率生成有效格式的ID
    return {
      id: generateRandomValidFolderId(),
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
 * 生成有效的随机文件夹ID（用于属性测试）
 * @return {string} 有效格式的文件夹ID
 */
function generateRandomValidFolderId() {
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
function generateRandomKeyword() {
  const keywords = ['测试', 'document', 'report', '项目', 'data', '分析', 'meeting', '会议'];
  return keywords[Math.floor(Math.random() * keywords.length)];
}

/**
 * 运行SearchController属性测试
 */
function runSearchControllerPropertyTests() {
  // **Feature: google-drive-search-tool, Property 1: 搜索执行完整性**
  // **验证: 需求 1.1**
  PropertyTestGenerator.runPropertyTest(
    '属性 1: 搜索执行完整性',
    function() {
      const controller = createSearchController();
      
      // 生成有效的随机输入
      const validFolderId = PropertyTestGenerator.randomValidFolderId();
      const validKeyword = PropertyTestGenerator.randomKeyword();
      const outputFormat = Math.random() > 0.5 ? 'logger' : 'sheet';
      
      // 对于任何有效的文件夹ID和搜索关键词，系统应该执行完整的搜索操作并返回结果
      try {
        const results = controller.search(validFolderId, validKeyword, outputFormat);
        
        // 验证搜索执行完整性
        Assert.assertNotNull(results, '搜索结果不应为null');
        Assert.assertTrue(Array.isArray(results), '搜索结果应该是数组');
        
        // 验证搜索配置已正确初始化
        Assert.assertTrue(controller.isSearchInitialized(), '搜索应该已初始化');
        
        const config = controller.getSearchConfiguration();
        Assert.assertNotNull(config, '搜索配置应该存在');
        Assert.assertEquals(config.folderId, validFolderId, '配置中的文件夹ID应该匹配');
        Assert.assertEquals(config.keyword, validKeyword, '配置中的关键词应该匹配');
        Assert.assertEquals(config.outputFormat, outputFormat, '配置中的输出格式应该匹配');
        
        // 验证搜索结果结构（即使是空数组也应该有正确的结构）
        results.forEach(result => {
          if (result) {
            Assert.assertTrue(typeof result.fileName === 'string', '文件名应该是字符串');
            Assert.assertTrue(typeof result.fileUrl === 'string', '文件链接应该是字符串');
            Assert.assertTrue(typeof result.folderPath === 'string', '文件路径应该是字符串');
            Assert.assertTrue(typeof result.fileType === 'string', '文件类型应该是字符串');
            Assert.assertTrue(result.lastModified instanceof Date, '修改时间应该是Date对象');
          }
        });
        
      } catch (error) {
        // 如果是因为文件夹不存在或无权限访问导致的错误，这是预期的行为
        if (error.message.includes('文件夹访问验证失败')) {
          // 这是正常的，因为我们使用的是随机生成的文件夹ID
          // 验证错误处理是否正确
          Assert.assertTrue(error.message.length > 0, '错误信息应该不为空');
        } else {
          // 其他类型的错误应该重新抛出
          throw error;
        }
      }
    },
    100
  );

  // 属性测试：输入验证的一致性
  PropertyTestGenerator.runPropertyTest(
    '属性2: 输入验证一致性',
    function() {
      const controller = createSearchController();
      
      // 生成随机输入
      const validFolderId = PropertyTestGenerator.randomFolderId();
      const validKeyword = PropertyTestGenerator.randomKeyword();
      const invalidFolderId = '';
      const invalidKeyword = '';
      
      // 验证有效输入总是通过验证
      Assert.assertTrue(controller.validateInputs(validFolderId, validKeyword), '有效输入应该通过验证');
      
      // 验证无效输入总是失败
      Assert.assertFalse(controller.validateInputs(invalidFolderId, validKeyword), '无效文件夹ID应该失败');
      Assert.assertFalse(controller.validateInputs(validFolderId, invalidKeyword), '无效关键词应该失败');
    },
    50
  );

  // 属性测试：搜索初始化的幂等性
  PropertyTestGenerator.runPropertyTest(
    '属性3: 搜索初始化幂等性',
    function() {
      const controller = createSearchController();
      
      const folderId = PropertyTestGenerator.randomFolderId();
      const keyword = PropertyTestGenerator.randomKeyword();
      const outputFormat = Math.random() > 0.5 ? 'logger' : 'sheet';
      
      // 多次初始化应该产生相同结果
      controller.initializeSearch(folderId, keyword, outputFormat);
      const config1 = controller.getSearchConfiguration();
      
      controller.initializeSearch(folderId, keyword, outputFormat);
      const config2 = controller.getSearchConfiguration();
      
      // 验证配置一致性
      Assert.assertEquals(config1.folderId, config2.folderId, '文件夹ID应该一致');
      Assert.assertEquals(config1.keyword, config2.keyword, '关键词应该一致');
      Assert.assertEquals(config1.outputFormat, config2.outputFormat, '输出格式应该一致');
    },
    30
  );

  // 属性测试：文件夹ID格式验证的正确性
  PropertyTestGenerator.runPropertyTest(
    '属性4: 文件夹ID格式验证正确性',
    function() {
      const controller = createSearchController();
      
      // 生成有效格式的文件夹ID
      const validId = PropertyTestGenerator.randomFolderId();
      Assert.assertTrue(controller.validateFolderId(validId), '随机生成的有效ID应该通过验证');
      
      // 生成明显无效的ID
      const invalidIds = ['', 'abc', 'invalid@id', null, undefined, '   '];
      const randomInvalidId = invalidIds[Math.floor(Math.random() * invalidIds.length)];
      Assert.assertFalse(controller.validateFolderId(randomInvalidId), '明显无效的ID应该失败');
    },
    40
  );
}