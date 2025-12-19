# Google Drive 全文检索工具使用示例

## 概述

本文档提供了Google Drive全文检索工具的详细使用示例，涵盖Web应用界面和脚本函数两种使用方式。

## Web应用界面示例

### 示例1：查找项目文档

**场景**：在项目文件夹中查找包含"需求分析"的所有文档

**步骤**：
1. 打开Web应用界面
2. 输入文件夹ID：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
3. 输入搜索关键词：`需求分析`
4. 选择输出格式：`Google Sheet表格`
5. 点击"开始搜索"

**预期结果**：
- 创建新的Google Sheet表格
- 显示所有包含"需求分析"的文档
- 包含文件名、类型、路径、链接等信息

### 示例2：技术文档搜索

**场景**：在技术文档库中搜索API相关文档

**步骤**：
1. 输入技术文档文件夹ID：`1ABC123XYZ789DEF456GHI`
2. 输入搜索关键词：`API接口`
3. 点击"显示高级选项"
4. 勾选"使用增量搜索"（适用于大型文档库）
5. 设置最大结果数量：`200`
6. 选择输出格式：`控制台日志`
7. 执行搜索

**预期结果**：
- 在网页上显示搜索结果表格
- 显示前200个匹配的API文档
- 提供直接访问链接

### 示例3：会议记录查找

**场景**：查找2024年第一季度的所有会议记录

**步骤**：
1. 输入会议文件夹ID：`1DEF456GHI789JKL012MNO`
2. 输入搜索关键词：`2024年第一季度`
3. 保持默认设置
4. 点击搜索

**预期结果**：
- 显示所有包含该关键词的会议记录
- 按时间排序显示结果
- 可直接点击链接查看文档

### 示例4：多关键词搜索

**场景**：查找同时包含"预算"和"审批"的财务文档

**步骤**：
1. 输入财务文件夹ID：`1GHI789JKL012MNO345PQR`
2. 输入搜索关键词：`预算 审批`（用空格分隔）
3. 选择Google Sheet输出
4. 执行搜索

**预期结果**：
- 找到同时包含两个关键词的文档
- 在Google Sheet中显示详细结果

## 脚本函数调用示例

### 示例1：基本搜索

```javascript
// 简单搜索示例
function basicSearchExample() {
  const folderId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  const keyword = '项目计划';
  
  // 执行搜索
  const results = simpleSearch(folderId, keyword);
  
  // 输出结果
  console.log(`找到 ${results.length} 个匹配文件`);
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.fileName} - ${result.fileUrl}`);
  });
}
```

### 示例2：自定义配置搜索

```javascript
// 自定义配置搜索示例
function customConfigSearchExample() {
  const folderId = '1ABC123XYZ789DEF456GHI';
  const keyword = '技术规范';
  
  // 设置自定义配置
  setSearchConfig({
    search: {
      maxResults: 500,
      batchSize: 25,
      maxDepth: 10
    },
    output: {
      defaultFormat: 'sheet',
      includeStatistics: true
    }
  });
  
  // 执行搜索
  const results = searchGoogleDrive(folderId, keyword, 'sheet');
  
  console.log('搜索完成，结果已保存到Google Sheet');
  return results;
}
```

### 示例3：增量搜索

```javascript
// 增量搜索示例（适用于大型文件夹）
function incrementalSearchExample() {
  const folderId = '1DEF456GHI789JKL012MNO';
  const keyword = '年度报告';
  
  // 执行增量搜索
  const result = searchGoogleDriveIncremental(folderId, keyword, 'logger');
  
  if (result.isComplete) {
    console.log(`增量搜索完成，找到 ${result.results.length} 个文件`);
  } else {
    console.log('搜索未完成，保存进度信息：');
    console.log(JSON.stringify(result.progress, null, 2));
    
    // 可以稍后继续搜索
    // const nextResult = searchGoogleDriveIncremental(folderId, keyword, 'logger', result.progress);
  }
  
  return result.results;
}
```

### 示例4：批量搜索

```javascript
// 批量搜索示例
function batchSearchExample() {
  const folderIds = [
    '1ABC123XYZ789DEF456GHI',  // 技术部门
    '1DEF456GHI789JKL012MNO',  // 市场部门
    '1GHI789JKL012MNO345PQR'   // 财务部门
  ];
  const keyword = '季度总结';
  
  // 执行批量搜索
  const results = batchSearch(folderIds, keyword, 'sheet');
  
  console.log(`批量搜索完成，总共找到 ${results.length} 个文件`);
  
  // 按部门统计结果
  const stats = {};
  results.forEach(result => {
    const dept = getDepartmentFromPath(result.folderPath);
    stats[dept] = (stats[dept] || 0) + 1;
  });
  
  console.log('各部门结果统计：', stats);
  return results;
}

// 辅助函数：从路径判断部门
function getDepartmentFromPath(path) {
  if (path.includes('技术')) return '技术部门';
  if (path.includes('市场')) return '市场部门';
  if (path.includes('财务')) return '财务部门';
  return '其他';
}
```

### 示例5：预设配置搜索

```javascript
// 使用预设配置的搜索示例
function presetConfigSearchExample() {
  const folderId = '1JKL012MNO345PQR678STU';
  const keyword = '用户手册';
  
  // 快速搜索（适合小型文件夹）
  console.log('执行快速搜索...');
  const quickResults = quickSearch(folderId, keyword, 'logger');
  
  // 深度搜索（适合大型文件夹）
  console.log('执行深度搜索...');
  const deepResults = deepSearch(folderId, keyword, 'sheet');
  
  // 性能优化搜索
  console.log('执行性能优化搜索...');
  const perfResults = performanceSearch(folderId, keyword, 'logger');
  
  console.log(`快速搜索: ${quickResults.length} 个结果`);
  console.log(`深度搜索: ${deepResults.length} 个结果`);
  console.log(`性能搜索: ${perfResults.length} 个结果`);
}
```

### 示例6：配置管理

```javascript
// 配置管理示例
function configManagementExample() {
  // 查看当前配置
  console.log('当前配置：');
  const currentConfig = getCurrentConfig();
  
  // 设置新配置
  console.log('设置新配置...');
  setSearchConfig({
    search: {
      maxResults: 1000,
      batchSize: 50,
      maxDepth: 15,
      timeoutMinutes: 4
    },
    output: {
      defaultFormat: 'sheet',
      sheetNameTemplate: '搜索结果_{date}_{time}',
      includeStatistics: true,
      maxBatchSize: 200
    },
    performance: {
      enableMonitoring: true,
      checkpointInterval: 100,
      nearTimeoutThreshold: 0.8
    },
    errorHandling: {
      skipPermissionErrors: true,
      continueOnError: true,
      maxErrorsBeforeStop: 50
    }
  });
  
  // 导出配置
  const configJson = exportConfig();
  console.log('配置已导出');
  
  // 重置为默认配置
  resetConfig();
  console.log('配置已重置为默认值');
  
  // 重新导入配置
  importConfig(configJson);
  console.log('配置已重新导入');
}
```

### 示例7：文件夹结构分析

```javascript
// 文件夹结构分析示例
function folderAnalysisExample() {
  const folderId = '1MNO345PQR678STU901VWX';
  
  // 获取文件夹结构
  console.log('获取文件夹结构...');
  const structure = getFolderStructure(folderId, 3);
  console.log('文件夹结构：', JSON.stringify(structure, null, 2));
  
  // 获取文件类型统计
  console.log('获取文件类型统计...');
  const stats = getFileTypeStatistics(folderId, true);
  console.log('文件类型统计：', JSON.stringify(stats, null, 2));
  
  // 分析文件夹大小
  if (stats.totalFiles > 1000) {
    console.log('建议使用增量搜索或深度搜索配置');
    setIncrementalSearchEnabled(true);
  } else if (stats.totalFiles > 500) {
    console.log('建议使用标准搜索配置');
    setDefaultBatchSize(75);
  } else {
    console.log('可以使用快速搜索配置');
    setDefaultBatchSize(25);
  }
}
```

### 示例8：错误处理和重试

```javascript
// 错误处理和重试示例
function errorHandlingExample() {
  const folderId = '1PQR678STU901VWX234YZA';
  const keyword = '重要文档';
  
  try {
    // 尝试标准搜索
    console.log('尝试标准搜索...');
    const results = searchGoogleDrive(folderId, keyword, 'logger');
    console.log(`搜索成功，找到 ${results.length} 个结果`);
    return results;
    
  } catch (error) {
    console.log('标准搜索失败，尝试增量搜索...');
    
    try {
      // 如果标准搜索失败，尝试增量搜索
      const incrementalResult = searchGoogleDriveIncremental(folderId, keyword, 'logger');
      console.log(`增量搜索完成，找到 ${incrementalResult.results.length} 个结果`);
      return incrementalResult.results;
      
    } catch (incrementalError) {
      console.log('增量搜索也失败，尝试简化搜索...');
      
      // 最后尝试简化搜索
      const simpleResults = simpleSearch(folderId, keyword, {
        outputFormat: 'logger',
        maxResults: 100
      });
      console.log(`简化搜索完成，找到 ${simpleResults.length} 个结果`);
      return simpleResults;
    }
  }
}
```

## 高级使用场景

### 场景1：定期文档审计

```javascript
// 定期文档审计示例
function documentAuditExample() {
  const auditFolders = [
    { id: '1ABC123', name: '合同文档' },
    { id: '1DEF456', name: '财务报表' },
    { id: '1GHI789', name: '人事档案' }
  ];
  
  const auditKeywords = ['过期', '待更新', '需审核'];
  const auditResults = [];
  
  auditFolders.forEach(folder => {
    console.log(`审计文件夹: ${folder.name}`);
    
    auditKeywords.forEach(keyword => {
      const results = simpleSearch(folder.id, keyword, {
        outputFormat: 'logger',
        maxResults: 50
      });
      
      if (results.length > 0) {
        auditResults.push({
          folder: folder.name,
          keyword: keyword,
          count: results.length,
          files: results
        });
      }
    });
  });
  
  // 生成审计报告
  console.log('=== 文档审计报告 ===');
  auditResults.forEach(result => {
    console.log(`${result.folder} - "${result.keyword}": ${result.count} 个文件`);
  });
  
  return auditResults;
}
```

### 场景2：知识库搜索

```javascript
// 知识库搜索示例
function knowledgeBaseSearchExample() {
  const knowledgeBaseFolderId = '1STU901VWX234YZA567BCD';
  const searchQueries = [
    '故障排除',
    '最佳实践',
    '操作手册',
    '常见问题'
  ];
  
  // 设置知识库搜索配置
  setSearchConfig({
    search: {
      maxResults: 200,
      batchSize: 30,
      maxDepth: 25
    },
    output: {
      defaultFormat: 'sheet',
      includeStatistics: true
    }
  });
  
  const knowledgeResults = {};
  
  searchQueries.forEach(query => {
    console.log(`搜索知识库: "${query}"`);
    const results = searchGoogleDrive(knowledgeBaseFolderId, query, 'sheet');
    knowledgeResults[query] = results;
    console.log(`"${query}" 找到 ${results.length} 个相关文档`);
  });
  
  return knowledgeResults;
}
```

### 场景3：项目文档整理

```javascript
// 项目文档整理示例
function projectDocumentOrganizationExample() {
  const projectFolderId = '1VWX234YZA567BCD890EFG';
  const documentTypes = [
    '需求文档',
    '设计文档',
    '测试文档',
    '用户手册',
    '技术规范'
  ];
  
  const organizationResults = {};
  
  // 为每种文档类型创建分类
  documentTypes.forEach(docType => {
    console.log(`整理 ${docType}...`);
    
    const results = deepSearch(projectFolderId, docType, 'logger');
    organizationResults[docType] = {
      count: results.length,
      files: results.map(result => ({
        name: result.fileName,
        path: result.folderPath,
        url: result.fileUrl,
        lastModified: result.lastModified
      }))
    };
  });
  
  // 生成整理报告
  console.log('=== 项目文档整理报告 ===');
  Object.keys(organizationResults).forEach(docType => {
    const data = organizationResults[docType];
    console.log(`${docType}: ${data.count} 个文件`);
    
    // 显示最近修改的文件
    const recentFiles = data.files
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 3);
    
    console.log('  最近修改的文件:');
    recentFiles.forEach(file => {
      console.log(`    - ${file.name} (${file.lastModified})`);
    });
  });
  
  return organizationResults;
}
```

## 性能优化示例

### 大型文件夹处理

```javascript
// 大型文件夹处理示例
function largefolderHandlingExample() {
  const largeFolderId = '1YZA567BCD890EFG123HIJ';
  const keyword = '重要';
  
  // 首先获取文件夹统计信息
  const stats = getFileTypeStatistics(largeFolderId, true);
  console.log(`文件夹包含 ${stats.totalFiles} 个文件`);
  
  if (stats.totalFiles > 5000) {
    console.log('使用增量搜索处理超大型文件夹...');
    
    // 设置增量搜索配置
    setSearchConfig({
      incremental: {
        enabled: true,
        defaultBatchSize: 25,
        maxExecutionTime: 300000  // 5分钟
      },
      search: {
        batchSize: 25,
        maxResults: 1000
      }
    });
    
    const result = searchGoogleDriveIncremental(largeFolderId, keyword, 'sheet');
    
    if (!result.isComplete) {
      console.log('搜索未完成，需要继续执行');
      console.log('进度信息已保存，可稍后继续');
    }
    
    return result.results;
    
  } else if (stats.totalFiles > 1000) {
    console.log('使用深度搜索处理大型文件夹...');
    return deepSearch(largeFolderId, keyword, 'sheet');
    
  } else {
    console.log('使用标准搜索处理中型文件夹...');
    return searchGoogleDrive(largeFolderId, keyword, 'sheet');
  }
}
```

## 错误处理最佳实践

```javascript
// 错误处理最佳实践示例
function errorHandlingBestPracticesExample() {
  const folderId = '1BCD890EFG123HIJ456KLM';
  const keyword = '测试文档';
  
  // 设置错误处理配置
  setSearchConfig({
    errorHandling: {
      skipPermissionErrors: true,
      skipNetworkErrors: false,
      continueOnError: true,
      maxErrorsBeforeStop: 20,
      logErrorDetails: true
    }
  });
  
  try {
    // 验证文件夹访问权限
    const folderInfo = getFolderInfo(folderId);
    if (!folderInfo.success) {
      throw new Error(`无法访问文件夹: ${folderInfo.error}`);
    }
    
    console.log(`开始搜索文件夹: ${folderInfo.data.name}`);
    
    // 执行搜索
    const results = searchGoogleDrive(folderId, keyword, 'logger');
    
    console.log(`搜索成功完成，找到 ${results.length} 个结果`);
    return results;
    
  } catch (error) {
    console.error('搜索过程中发生错误:', error.message);
    
    // 根据错误类型提供建议
    if (error.message.includes('权限')) {
      console.log('建议: 检查文件夹访问权限');
    } else if (error.message.includes('配额')) {
      console.log('建议: 等待API配额重置或使用增量搜索');
    } else if (error.message.includes('超时')) {
      console.log('建议: 使用增量搜索或减小搜索范围');
    }
    
    return [];
  }
}
```

## 总结

这些示例涵盖了Google Drive全文检索工具的主要使用场景，包括：

1. **基本搜索**：简单的文件内容搜索
2. **高级搜索**：使用自定义配置和增量搜索
3. **批量操作**：在多个文件夹中搜索
4. **配置管理**：自定义工具行为
5. **错误处理**：处理各种异常情况
6. **性能优化**：处理大型文件夹
7. **实际应用**：文档审计、知识库搜索、项目整理

根据您的具体需求选择合适的示例进行参考和修改。