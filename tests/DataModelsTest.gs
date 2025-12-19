/**
 * 数据模型测试
 * 测试核心数据结构的创建和验证
 */

/**
 * 运行所有数据模型测试
 */
function runDataModelsTests() {
  const suite = new TestSuite('数据模型测试');

  // 测试SearchResult创建
  suite.addTest('创建SearchResult对象', function() {
    const result = createSearchResult(
      'test.pdf',
      'https://drive.google.com/file/d/123/view',
      '/root/folder',
      'application/pdf',
      new Date()
    );

    Assert.assertEquals(result.fileName, 'test.pdf');
    Assert.assertEquals(result.fileUrl, 'https://drive.google.com/file/d/123/view');
    Assert.assertEquals(result.folderPath, '/root/folder');
    Assert.assertEquals(result.fileType, 'application/pdf');
    Assert.assertNotNull(result.lastModified);
  });

  // 测试FileMatch创建
  suite.addTest('创建FileMatch对象', function() {
    const mockFile = { getName: () => 'test.doc', getId: () => '123' };
    const match = createFileMatch(mockFile, '/parent/path');

    Assert.assertEquals(match.file, mockFile);
    Assert.assertEquals(match.parentPath, '/parent/path');
  });

  // 测试SearchConfiguration创建
  suite.addTest('创建SearchConfiguration对象', function() {
    const config = createSearchConfiguration('folder123', 'keyword', 'logger');

    Assert.assertEquals(config.folderId, 'folder123');
    Assert.assertEquals(config.keyword, 'keyword');
    Assert.assertEquals(config.outputFormat, 'logger');
    Assert.assertNotNull(config.includeFileTypes);
    Assert.assertTrue(config.includeFileTypes.length > 0);
  });

  // 测试带选项的SearchConfiguration创建
  suite.addTest('创建带选项的SearchConfiguration对象', function() {
    const options = {
      maxResults: 50,
      includeFileTypes: ['application/pdf']
    };
    const config = createSearchConfiguration('folder123', 'keyword', 'sheet', options);

    Assert.assertEquals(config.maxResults, 50);
    Assert.assertEquals(config.includeFileTypes.length, 1);
    Assert.assertEquals(config.includeFileTypes[0], 'application/pdf');
  });

  suite.run();
}

/**
 * 运行数据模型的属性测试
 */
function runDataModelsPropertyTests() {
  // 属性测试：SearchResult创建的完整性
  PropertyTestGenerator.runPropertyTest(
    '属性1: SearchResult创建完整性',
    function() {
      const fileName = PropertyTestGenerator.randomString(1, 50);
      const fileUrl = 'https://drive.google.com/file/d/' + PropertyTestGenerator.randomString(20, 30) + '/view';
      const folderPath = '/' + PropertyTestGenerator.randomString(5, 20);
      const fileType = 'application/pdf';
      const lastModified = new Date();

      const result = createSearchResult(fileName, fileUrl, folderPath, fileType, lastModified);

      // 验证所有字段都被正确设置
      Assert.assertEquals(result.fileName, fileName);
      Assert.assertEquals(result.fileUrl, fileUrl);
      Assert.assertEquals(result.folderPath, folderPath);
      Assert.assertEquals(result.fileType, fileType);
      Assert.assertEquals(result.lastModified, lastModified);
    },
    50
  );

  // 属性测试：SearchConfiguration默认值
  PropertyTestGenerator.runPropertyTest(
    '属性2: SearchConfiguration默认值正确性',
    function() {
      const folderId = PropertyTestGenerator.randomFolderId();
      const keyword = PropertyTestGenerator.randomKeyword();
      const outputFormat = Math.random() > 0.5 ? 'logger' : 'sheet';

      const config = createSearchConfiguration(folderId, keyword, outputFormat);

      // 验证默认文件类型包含所有支持的格式
      Assert.assertTrue(config.includeFileTypes.includes('application/vnd.google-apps.document'));
      Assert.assertTrue(config.includeFileTypes.includes('application/pdf'));
      Assert.assertTrue(config.includeFileTypes.includes('text/plain'));
      Assert.assertEquals(config.folderId, folderId);
      Assert.assertEquals(config.keyword, keyword);
      Assert.assertEquals(config.outputFormat, outputFormat);
    },
    30
  );
}