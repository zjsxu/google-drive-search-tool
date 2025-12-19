/**
 * ContentMatcher 测试
 * 测试内容匹配器的核心功能
 */

/**
 * 运行ContentMatcher单元测试
 */
function runContentMatcherTests() {
  const suite = new TestSuite('ContentMatcher测试');

  // 测试ContentMatcher创建
  suite.addTest('创建ContentMatcher实例', function() {
    const matcher = createContentMatcher();
    
    Assert.assertNotNull(matcher, 'ContentMatcher实例应该被创建');
    Assert.assertTrue(Array.isArray(matcher.getSupportedMimeTypes()), '支持的MIME类型应该是数组');
    Assert.assertTrue(matcher.getSupportedMimeTypes().length > 0, '应该支持至少一种文件类型');
  });

  // 测试支持的文件类型
  suite.addTest('支持的文件类型检查', function() {
    const matcher = createContentMatcher();
    const supportedTypes = matcher.getSupportedMimeTypes();
    
    // 验证支持的文件类型
    Assert.assertTrue(supportedTypes.includes('application/vnd.google-apps.document'), '应该支持Google Docs');
    Assert.assertTrue(supportedTypes.includes('application/pdf'), '应该支持PDF');
    Assert.assertTrue(supportedTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), '应该支持Word文档');
    Assert.assertTrue(supportedTypes.includes('text/plain'), '应该支持文本文件');
    Assert.assertTrue(supportedTypes.includes('application/vnd.google-apps.spreadsheet'), '应该支持Google Sheets');
    
    // 验证MIME类型检查
    Assert.assertTrue(matcher.isMimeTypeSupported('application/vnd.google-apps.document'), 'Google Docs应该被支持');
    Assert.assertFalse(matcher.isMimeTypeSupported('image/jpeg'), '图片文件不应该被支持');
  });

  // 测试搜索查询构建
  suite.addTest('搜索查询构建', function() {
    const matcher = createContentMatcher();
    
    const folderId = 'test-folder-id';
    const keyword = 'test keyword';
    const query = matcher.buildSearchQuery(folderId, keyword);
    
    Assert.assertNotNull(query, '查询字符串不应为null');
    Assert.assertTrue(typeof query === 'string', '查询应该是字符串');
    Assert.assertTrue(query.includes(`parents in "${folderId}"`), '查询应该包含父文件夹限制');
    Assert.assertTrue(query.includes(`fullText contains "${keyword}"`), '查询应该包含全文搜索');
    Assert.assertTrue(query.includes('trashed = false'), '查询应该排除回收站文件');
    
    // 验证查询有效性
    Assert.assertTrue(matcher.validateSearchQuery(query), '构建的查询应该是有效的');
  });

  // 测试关键词转义
  suite.addTest('关键词转义功能', function() {
    const matcher = createContentMatcher();
    
    // 测试包含特殊字符的关键词
    const specialKeyword = 'test "quoted" keyword';
    const escapedKeyword = matcher.escapeSearchKeyword(specialKeyword);
    
    Assert.assertNotNull(escapedKeyword, '转义后的关键词不应为null');
    Assert.assertTrue(typeof escapedKeyword === 'string', '转义后的关键词应该是字符串');
    Assert.assertTrue(escapedKeyword.includes('\\"'), '引号应该被转义');
  });

  // 测试文件类型名称获取
  suite.addTest('文件类型名称获取', function() {
    const matcher = createContentMatcher();
    
    Assert.assertEquals(matcher.getFileTypeName('application/vnd.google-apps.document'), 'Google Docs', 'Google Docs类型名称应该正确');
    Assert.assertEquals(matcher.getFileTypeName('application/pdf'), 'PDF', 'PDF类型名称应该正确');
    Assert.assertEquals(matcher.getFileTypeName('text/plain'), '文本文件', '文本文件类型名称应该正确');
    Assert.assertEquals(matcher.getFileTypeName('unknown/type'), '未知类型', '未知类型应该返回默认名称');
  });

  // 测试文件扩展名提取
  suite.addTest('文件扩展名提取', function() {
    const matcher = createContentMatcher();
    
    Assert.assertEquals(matcher.getFileExtension('test.pdf'), 'pdf', 'PDF扩展名应该正确');
    Assert.assertEquals(matcher.getFileExtension('document.docx'), 'docx', 'Word扩展名应该正确');
    Assert.assertEquals(matcher.getFileExtension('file.txt'), 'txt', '文本扩展名应该正确');
    Assert.assertEquals(matcher.getFileExtension('noextension'), '', '无扩展名应该返回空字符串');
    Assert.assertEquals(matcher.getFileExtension(''), '', '空文件名应该返回空字符串');
  });

  // 测试文件处理策略
  suite.addTest('文件处理策略', function() {
    const matcher = createContentMatcher();
    
    Assert.assertTrue(matcher.canSearchFileContent('application/vnd.google-apps.document'), 'Google Docs应该支持内容搜索');
    Assert.assertTrue(matcher.canSearchFileContent('application/pdf'), 'PDF应该支持内容搜索');
    Assert.assertFalse(matcher.canSearchFileContent('image/jpeg'), '图片不应该支持内容搜索');
    
    Assert.assertTrue(matcher.requiresSpecialHandling('application/pdf'), 'PDF应该需要特殊处理');
    Assert.assertFalse(matcher.requiresSpecialHandling('text/plain'), '文本文件不需要特殊处理');
    
    Assert.assertEquals(matcher.getProcessingMethod('application/vnd.google-apps.document'), 'google_docs_api', 'Google Docs应该使用正确的处理方法');
    Assert.assertEquals(matcher.getProcessingMethod('application/pdf'), 'drive_api_fulltext', 'PDF应该使用正确的处理方法');
  });

  // 测试查询验证
  suite.addTest('查询验证功能', function() {
    const matcher = createContentMatcher();
    
    // 有效查询
    const validQuery = 'parents in "folder-id" and fullText contains "keyword" and trashed = false';
    Assert.assertTrue(matcher.validateSearchQuery(validQuery), '有效查询应该通过验证');
    
    // 无效查询
    Assert.assertFalse(matcher.validateSearchQuery(''), '空查询应该无效');
    Assert.assertFalse(matcher.validateSearchQuery(null), 'null查询应该无效');
    Assert.assertFalse(matcher.validateSearchQuery('incomplete query'), '不完整查询应该无效');
  });

  suite.run();
}

/**
 * 运行ContentMatcher属性测试
 */
function runContentMatcherPropertyTests() {
  console.log('\n=== 运行ContentMatcher属性测试 ===');

  // 属性测试：查询构建的一致性
  PropertyTestGenerator.runPropertyTest(
    '属性: 查询构建一致性',
    function() {
      const matcher = createContentMatcher();
      
      const folderId = PropertyTestGenerator.randomValidFolderId();
      const keyword = PropertyTestGenerator.randomKeyword();
      
      // 多次构建相同参数的查询应该产生相同结果
      const query1 = matcher.buildSearchQuery(folderId, keyword);
      const query2 = matcher.buildSearchQuery(folderId, keyword);
      
      Assert.assertEquals(query1, query2, '相同参数应该产生相同查询');
      Assert.assertTrue(matcher.validateSearchQuery(query1), '构建的查询应该有效');
      Assert.assertTrue(matcher.validateSearchQuery(query2), '构建的查询应该有效');
    },
    50
  );

  // 属性测试：文件类型检测的正确性
  PropertyTestGenerator.runPropertyTest(
    '属性: 文件类型检测正确性',
    function() {
      const matcher = createContentMatcher();
      const supportedTypes = matcher.getSupportedMimeTypes();
      
      // 随机选择一个支持的类型
      const randomSupportedType = supportedTypes[Math.floor(Math.random() * supportedTypes.length)];
      
      // 支持的类型应该通过所有相关检查
      Assert.assertTrue(matcher.isMimeTypeSupported(randomSupportedType), '支持的类型应该被识别为支持');
      Assert.assertTrue(matcher.canSearchFileContent(randomSupportedType), '支持的类型应该支持内容搜索');
      Assert.assertNotNull(matcher.getFileTypeName(randomSupportedType), '支持的类型应该有名称');
      Assert.assertNotNull(matcher.getProcessingMethod(randomSupportedType), '支持的类型应该有处理方法');
    },
    30
  );

  // 属性测试：关键词转义的安全性
  PropertyTestGenerator.runPropertyTest(
    '属性: 关键词转义安全性',
    function() {
      const matcher = createContentMatcher();
      
      // 生成包含特殊字符的关键词
      const specialChars = ['"', "'", '\\'];
      const randomChar = specialChars[Math.floor(Math.random() * specialChars.length)];
      const keyword = `test${randomChar}keyword`;
      
      const escapedKeyword = matcher.escapeSearchKeyword(keyword);
      
      // 转义后的关键词应该是安全的
      Assert.assertNotNull(escapedKeyword, '转义后的关键词不应为null');
      Assert.assertTrue(typeof escapedKeyword === 'string', '转义后的关键词应该是字符串');
      
      // 构建查询应该成功
      const folderId = PropertyTestGenerator.randomValidFolderId();
      const query = matcher.buildSearchQuery(folderId, keyword);
      Assert.assertTrue(matcher.validateSearchQuery(query), '包含特殊字符的查询应该有效');
    },
    40
  );
}

/**
 * 任务 3.3: 为文件类型支持编写属性测试
 * 运行文件类型支持完整性的属性测试
 */
function runTask3_3_FileTypeSupportPropertyTest() {
  console.log('\n=== 运行任务 3.3: 文件类型支持完整性属性测试 ===');
  
  // **Feature: google-drive-search-tool, Property 2: 文件类型支持完整性**
  // **验证: 需求 1.2**
  PropertyTestGenerator.runPropertyTest(
    '属性 2: 文件类型支持完整性',
    function() {
      const matcher = createContentMatcher();
      
      // 获取所有支持的文件类型
      const supportedTypes = matcher.getSupportedMimeTypes();
      
      // 验证所有必需的文件类型都被支持
      const requiredTypes = [
        'application/vnd.google-apps.document',      // Google Docs
        'application/pdf',                           // PDF
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
        'text/plain',                               // TXT
        'application/vnd.google-apps.spreadsheet'   // Google Sheets
      ];
      
      // 随机选择一个必需的文件类型进行测试
      const randomRequiredType = requiredTypes[Math.floor(Math.random() * requiredTypes.length)];
      
      // 验证该文件类型被支持
      Assert.assertTrue(
        supportedTypes.includes(randomRequiredType), 
        `必需的文件类型应该被支持: ${randomRequiredType}`
      );
      
      // 验证该文件类型可以进行内容搜索
      Assert.assertTrue(
        matcher.canSearchFileContent(randomRequiredType),
        `支持的文件类型应该能够检索内部文本内容: ${randomRequiredType}`
      );
      
      // 验证该文件类型有正确的处理方法
      const processingMethod = matcher.getProcessingMethod(randomRequiredType);
      Assert.assertNotNull(
        processingMethod,
        `支持的文件类型应该有处理方法: ${randomRequiredType}`
      );
      Assert.assertTrue(
        processingMethod !== 'none',
        `支持的文件类型应该有有效的处理方法: ${randomRequiredType}`
      );
      
      // 验证该文件类型有友好的名称
      const typeName = matcher.getFileTypeName(randomRequiredType);
      Assert.assertNotNull(
        typeName,
        `支持的文件类型应该有友好名称: ${randomRequiredType}`
      );
      Assert.assertTrue(
        typeName !== '未知类型',
        `支持的文件类型应该有正确的友好名称: ${randomRequiredType}`
      );
      
      // 验证文件类型检测策略的完整性
      const mockFile = createMockFileWithMimeType(randomRequiredType);
      if (mockFile) {
        const strategy = matcher.detectFileTypeAndStrategy(mockFile);
        
        Assert.assertTrue(
          strategy.isSupported,
          `支持的文件类型检测策略应该标记为支持: ${randomRequiredType}`
        );
        Assert.assertTrue(
          strategy.canSearchContent,
          `支持的文件类型应该能够搜索内容: ${randomRequiredType}`
        );
        Assert.assertEquals(
          strategy.mimeType,
          randomRequiredType,
          `文件类型检测应该返回正确的MIME类型: ${randomRequiredType}`
        );
      }
      
      // 验证搜索查询构建包含该文件类型
      const folderId = PropertyTestGenerator.randomValidFolderId();
      const keyword = PropertyTestGenerator.randomKeyword();
      const query = matcher.buildSearchQuery(folderId, keyword);
      
      Assert.assertTrue(
        query.includes(`mimeType = "${randomRequiredType}"`),
        `搜索查询应该包含支持的文件类型: ${randomRequiredType}`
      );
    },
    100
  );
}

/**
 * 创建具有指定MIME类型的模拟文件对象
 * @param {string} mimeType - MIME类型
 * @return {Object|null} 模拟文件对象或null
 */
function createMockFileWithMimeType(mimeType) {
  try {
    // 创建一个简单的模拟文件对象用于测试
    return {
      getMimeType: function() { return mimeType; },
      getName: function() { return `test_file_${Date.now()}`; },
      getId: function() { return `test_id_${Date.now()}`; }
    };
  } catch (error) {
    console.log(`创建模拟文件时发生错误: ${error.message}`);
    return null;
  }
}

/**
 * 任务 3.4: 为搜索准确性编写属性测试
 * 运行搜索准确性的属性测试
 */
function runTask3_4_SearchAccuracyPropertyTest() {
  console.log('\n=== 运行任务 3.4: 搜索准确性属性测试 ===');
  
  // **Feature: google-drive-search-tool, Property 3: 搜索准确性**
  // **验证: 需求 1.3**
  
  console.log('\n=== 运行属性测试: 属性 3: 搜索准确性 ===');
  
  let passed = 0;
  let failed = 0;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    try {
      // 属性测试逻辑
      const matcher = createContentMatcher();
      
      // 生成随机测试数据
      const folderId = generateRandomValidFolderId();
      const keyword = generateRandomKeyword();
      
      // 测试搜索查询构建的准确性
      const query = matcher.buildSearchQuery(folderId, keyword);
      
      // 简化的断言函数，避免依赖外部框架
      function assertTrue(condition, message) {
        if (!condition) {
          throw new Error(`断言失败: ${message}`);
        }
      }
      
      function assertNotNull(value, message) {
        if (value === null || value === undefined) {
          throw new Error(`断言失败: ${message}`);
        }
      }
      
      // 验证查询包含正确的全文搜索条件
      assertTrue(
        query.includes(`fullText contains "${keyword}"`),
        `搜索查询应该包含关键词的全文搜索条件: ${keyword}`
      );
      
      // 验证查询限制在指定文件夹
      assertTrue(
        query.includes(`parents in "${folderId}"`),
        `搜索查询应该限制在指定文件夹: ${folderId}`
      );
      
      // 验证查询排除回收站文件
      assertTrue(
        query.includes('trashed = false'),
        '搜索查询应该排除回收站中的文件'
      );
      
      // 验证查询只包含支持的文件类型
      const supportedTypes = matcher.getSupportedMimeTypes();
      let foundSupportedType = false;
      
      for (const mimeType of supportedTypes) {
        if (query.includes(`mimeType = "${mimeType}"`)) {
          foundSupportedType = true;
          break;
        }
      }
      
      assertTrue(
        foundSupportedType,
        '搜索查询应该包含至少一种支持的文件类型'
      );
      
      // 验证查询的有效性
      assertTrue(
        matcher.validateSearchQuery(query),
        '构建的搜索查询应该是有效的'
      );
      
      // 测试关键词转义的准确性
      const specialKeyword = `test"${keyword}'special`;
      const escapedQuery = matcher.buildSearchQuery(folderId, specialKeyword);
      
      assertTrue(
        matcher.validateSearchQuery(escapedQuery),
        '包含特殊字符的关键词应该被正确转义并生成有效查询'
      );
      
      // 验证转义后的查询仍然包含原始关键词的核心部分
      assertTrue(
        escapedQuery.includes('fullText contains'),
        '转义后的查询应该仍然包含全文搜索条件'
      );
      
      // 测试文件类型过滤的准确性
      const randomSupportedType = supportedTypes[Math.floor(Math.random() * supportedTypes.length)];
      const typeSpecificResults = matcher.searchSpecificFileType(folderId, keyword, randomSupportedType);
      
      // 由于这是模拟环境，我们验证方法调用不会抛出异常
      assertTrue(
        Array.isArray(typeSpecificResults),
        '特定文件类型搜索应该返回数组结果'
      );
      
      // 测试多文件类型搜索的准确性
      const multiTypeResults = matcher.searchMultipleFileTypes(folderId, keyword);
      
      assertNotNull(
        multiTypeResults,
        '多文件类型搜索应该返回结果对象'
      );
      
      assertTrue(
        typeof multiTypeResults.total === 'number',
        '多文件类型搜索结果应该包含总数'
      );
      
      assertTrue(
        multiTypeResults.total >= 0,
        '搜索结果总数应该是非负数'
      );
      
      // 验证结果分类的准确性
      const expectedCategories = ['googleDocs', 'pdf', 'word', 'text', 'googleSheets'];
      for (const category of expectedCategories) {
        assertTrue(
          Array.isArray(multiTypeResults[category]),
          `搜索结果应该包含 ${category} 分类数组`
        );
      }
      
      // 验证byType对象存在
      assertNotNull(
        multiTypeResults.byType,
        '搜索结果应该包含按类型分组的对象'
      );
      
      assertTrue(
        typeof multiTypeResults.byType === 'object',
        'byType应该是一个对象'
      );
      
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
 * 生成有效的随机文件夹ID（用于属性测试）
 * @return {string} 有效格式的文件夹ID
 */
function generateRandomValidFolderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
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
 * 生成随机文件名用于测试
 * @return {string} 随机文件名
 */
function generateRandomFileName() {
  const extensions = ['pdf', 'docx', 'txt', 'doc', 'xlsx'];
  const names = ['document', 'report', 'file', 'test', 'data'];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomExt = extensions[Math.floor(Math.random() * extensions.length)];
  
  return `${randomName}_${Math.floor(Math.random() * 1000)}.${randomExt}`;
}

/**
 * 任务 3.5: 为搜索范围限制编写属性测试
 * 运行搜索范围限制的属性测试
 */
function runTask3_5_SearchScopeLimitationPropertyTest() {
  console.log('\n=== 运行任务 3.5: 搜索范围限制属性测试 ===');
  
  // **Feature: google-drive-search-tool, Property 10: 搜索范围限制**
  // **验证: 需求 5.1, 5.2, 5.4**
  
  console.log('\n=== 运行属性测试: 属性 10: 搜索范围限制 ===');
  
  let passed = 0;
  let failed = 0;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    try {
      // 属性测试逻辑
      const matcher = createContentMatcher();
      
      // 生成随机测试数据
      const folderId = generateRandomValidFolderId();
      const keyword = generateRandomKeyword();
      
      // 简化的断言函数，避免依赖外部框架
      function assertTrue(condition, message) {
        if (!condition) {
          throw new Error(`断言失败: ${message}`);
        }
      }
      
      function assertNotNull(value, message) {
        if (value === null || value === undefined) {
          throw new Error(`断言失败: ${message}`);
        }
      }
      
      // 验证需求 5.1: 搜索仅限于指定文件夹及其子文件夹
      const query = matcher.buildSearchQuery(folderId, keyword);
      
      assertTrue(
        query.includes(`parents in "${folderId}"`),
        `搜索查询应该限制在指定文件夹范围内: ${folderId}`
      );
      
      // 验证需求 5.2: 使用Drive API查询语法限定父文件夹范围
      assertTrue(
        query.includes('parents in'),
        '搜索查询应该使用Drive API的parents语法限定文件夹范围'
      );
      
      // 验证查询语法的正确性
      const parentsPattern = /parents in "([^"]+)"/;
      const match = query.match(parentsPattern);
      
      assertTrue(
        match !== null,
        '搜索查询应该包含正确格式的parents子句'
      );
      
      assertTrue(
        match[1] === folderId,
        `parents子句应该包含正确的文件夹ID: 期望 ${folderId}, 实际 ${match[1]}`
      );
      
      // 验证需求 5.4: 排除回收站中的文件
      assertTrue(
        query.includes('trashed = false'),
        '搜索查询应该排除回收站中的文件'
      );
      
      // 验证trashed条件的位置和格式
      assertTrue(
        query.indexOf('trashed = false') > query.indexOf('parents in'),
        'trashed条件应该在parents条件之后'
      );
      
      // 验证查询不包含其他文件夹的限制
      const otherFolderId = generateRandomValidFolderId();
      if (otherFolderId !== folderId) {
        assertTrue(
          !query.includes(`parents in "${otherFolderId}"`),
          `搜索查询不应该包含其他文件夹ID: ${otherFolderId}`
        );
      }
      
      // 验证搜索范围限制的完整性
      assertTrue(
        matcher.validateSearchQuery(query),
        '构建的搜索查询应该是有效的'
      );
      
      // 测试特定文件类型搜索的范围限制
      const supportedTypes = matcher.getSupportedMimeTypes();
      const randomType = supportedTypes[Math.floor(Math.random() * supportedTypes.length)];
      
      const typeSpecificQuery = `parents in "${folderId}" and fullText contains "${keyword}" and mimeType = "${randomType}" and trashed = false`;
      
      assertTrue(
        matcher.validateSearchQuery(typeSpecificQuery),
        '特定文件类型的搜索查询应该包含正确的范围限制'
      );
      
      // 验证多文件类型搜索的范围限制
      const multiTypeResults = matcher.searchMultipleFileTypes(folderId, keyword);
      
      assertNotNull(
        multiTypeResults,
        '多文件类型搜索应该返回结果对象'
      );
      
      // 由于这是模拟环境，我们验证方法调用不会抛出异常
      assertTrue(
        typeof multiTypeResults.total === 'number',
        '多文件类型搜索结果应该包含总数'
      );
      
      // 测试搜索查询构建的一致性
      const query2 = matcher.buildSearchQuery(folderId, keyword);
      
      assertTrue(
        query === query2,
        '相同参数应该产生相同的搜索查询'
      );
      
      // 验证查询中的所有必要组件都存在
      const requiredComponents = [
        `parents in "${folderId}"`,
        `fullText contains "${keyword}"`,
        'trashed = false'
      ];
      
      for (const component of requiredComponents) {
        assertTrue(
          query.includes(component),
          `搜索查询应该包含必要组件: ${component}`
        );
      }
      
      // 验证查询不包含不应该存在的组件
      const forbiddenComponents = [
        'trashed = true',
        'parents not in',
        'fullText not contains'
      ];
      
      for (const component of forbiddenComponents) {
        assertTrue(
          !query.includes(component),
          `搜索查询不应该包含禁止的组件: ${component}`
        );
      }
      
      // 测试关键词转义不影响范围限制
      const specialKeyword = `test"${keyword}'special`;
      const escapedQuery = matcher.buildSearchQuery(folderId, specialKeyword);
      
      assertTrue(
        escapedQuery.includes(`parents in "${folderId}"`),
        '关键词转义不应该影响文件夹范围限制'
      );
      
      assertTrue(
        escapedQuery.includes('trashed = false'),
        '关键词转义不应该影响回收站排除条件'
      );
      
      // 验证文件类型限制与范围限制的组合
      assertTrue(
        query.includes('mimeType ='),
        '搜索查询应该包含文件类型限制'
      );
      
      // 确保文件类型限制不会覆盖范围限制
      const mimeTypeIndex = query.indexOf('mimeType =');
      const parentsIndex = query.indexOf('parents in');
      
      assertTrue(
        parentsIndex < mimeTypeIndex,
        'parents条件应该在mimeType条件之前'
      );
      
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