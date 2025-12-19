# Google Drive 全文检索工具使用指南

## 概述

Google Drive 全文检索工具是一个基于 Google Apps Script 的轻量级自动化工具，可以对指定的 Google Drive 文件夹进行深度递归搜索，支持多种文件格式的全文检索。

## 使用方式

本工具提供两种使用方式：

### 1. Web应用界面（推荐）
通过友好的网页界面进行搜索，适合普通用户使用。

### 2. 脚本函数调用
直接调用JavaScript函数，适合开发者和高级用户。

## Web应用界面使用指南

### 部署Web应用

1. **打开Google Apps Script项目**
   - 访问 [Google Apps Script](https://script.google.com/)
   - 打开您的Google Drive搜索工具项目

2. **部署为Web应用**
   - 点击右上角的"部署"按钮
   - 选择"新建部署"
   - 类型选择"Web应用"
   - 执行身份：选择"我"
   - 访问权限：根据需要选择（建议选择"任何人"以便团队使用）
   - 点击"部署"

3. **获取Web应用URL**
   - 复制生成的Web应用URL
   - 在浏览器中打开该URL即可使用

### Web界面功能

#### 基本搜索
1. **输入文件夹ID**
   - 在Google Drive中打开目标文件夹
   - 从URL中复制文件夹ID
   - 例如：`https://drive.google.com/drive/folders/1ABC...XYZ`
   - 文件夹ID为：`1ABC...XYZ`

2. **输入搜索关键词**
   - 输入要在文件内容中搜索的关键词
   - 支持中文、英文和特殊字符

3. **选择输出格式**
   - **控制台日志**：结果显示在网页上
   - **Google Sheet表格**：创建新的Google Sheet保存结果

4. **点击"开始搜索"**
   - 系统将显示搜索进度
   - 搜索完成后显示结果

#### 高级选项
点击"显示高级选项"可以配置：

- **使用增量搜索**：适用于包含大量文件的文件夹
- **最大结果数量**：限制返回的搜索结果数量

#### 搜索结果
- **表格显示**：文件名、类型、路径、修改时间
- **直接链接**：点击"打开文件"直接访问文件
- **统计信息**：显示搜索统计和性能数据

### Web应用示例场景

#### 场景1：查找项目文档
1. 打开Web应用界面
2. 输入项目文件夹ID：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
3. 输入关键词：`需求文档`
4. 选择输出格式：`Google Sheet表格`
5. 点击搜索，查看结果

#### 场景2：搜索技术文档
1. 输入技术文档文件夹ID
2. 输入关键词：`API接口`
3. 启用高级选项中的"使用增量搜索"
4. 设置最大结果数量：`100`
5. 执行搜索

#### 场景3：查找会议记录
1. 输入会议文件夹ID
2. 输入关键词：`2024年第一季度`
3. 选择控制台日志输出
4. 查看网页上的搜索结果

### 权限设置指南

#### 必需的API权限
在Google Apps Script项目中确保启用以下权限：

1. **Google Drive API**
   - 在Apps Script编辑器中点击"服务"
   - 添加"Google Drive API v3"

2. **OAuth权限范围**
   确保`appsscript.json`包含以下权限：
   ```json
   {
     "oauthScopes": [
       "https://www.googleapis.com/auth/drive.readonly",
       "https://www.googleapis.com/auth/drive.file",
       "https://www.googleapis.com/auth/spreadsheets"
     ]
   }
   ```

#### 文件夹访问权限
- 确保您对目标文件夹有**查看者**或更高权限
- 如果文件夹包含受限文件，工具会自动跳过无权限的文件
- 建议使用具有广泛访问权限的账户部署Web应用

### 故障排除

#### 常见问题

**问题1：无法访问文件夹**
- 检查文件夹ID是否正确
- 确认您有文件夹的访问权限
- 尝试在Google Drive中直接打开该文件夹

**问题2：搜索结果为空**
- 确认关键词拼写正确
- 检查文件类型是否在支持列表中
- 验证文件是否在回收站中

**问题3：搜索超时**
- 启用"使用增量搜索"选项
- 减小搜索范围或设置最大结果数量
- 尝试在文件较少的时间段进行搜索

**问题4：权限错误**
- 重新授权Web应用权限
- 检查Google Drive API是否已启用
- 确认部署设置中的执行权限

#### 性能优化建议

1. **小型文件夹（< 500个文件）**
   - 使用标准搜索模式
   - 选择控制台日志输出以获得更快响应

2. **大型文件夹（> 500个文件）**
   - 启用增量搜索选项
   - 选择Google Sheet输出
   - 设置合理的最大结果数量

3. **超大型文件夹（> 2000个文件）**
   - 必须使用增量搜索
   - 考虑分批搜索不同的子文件夹
   - 在非高峰时间进行搜索

## 脚本函数调用指南

### 主要功能

### 1. 基本搜索功能

#### 简单搜索
```javascript
// 最简单的搜索方式
const results = simpleSearch('YOUR_FOLDER_ID', '搜索关键词');

// 指定输出格式
const results = simpleSearch('YOUR_FOLDER_ID', '搜索关键词', {
  outputFormat: 'sheet'  // 'logger' 或 'sheet'
});
```

#### 标准搜索
```javascript
// 使用默认配置搜索
const results = searchGoogleDrive('YOUR_FOLDER_ID', '搜索关键词');

// 指定输出格式
const results = searchGoogleDrive('YOUR_FOLDER_ID', '搜索关键词', 'sheet');

// 使用自定义选项
const results = searchGoogleDrive('YOUR_FOLDER_ID', '搜索关键词', 'logger', {
  maxResults: 500,
  batchSize: 50
});
```

#### 增量搜索（处理大量文件）
```javascript
// 首次增量搜索
const result = searchGoogleDriveIncremental('YOUR_FOLDER_ID', '搜索关键词', 'logger');

// 如果搜索未完成，可以继续
if (!result.isComplete) {
  const savedProgress = result.progress;
  // 稍后继续搜索
  const nextResult = searchGoogleDriveIncremental(
    'YOUR_FOLDER_ID', 
    '搜索关键词', 
    'logger', 
    savedProgress
  );
}
```

### 2. 预设配置搜索

#### 快速搜索（适合小型文件夹）
```javascript
const results = quickSearch('YOUR_FOLDER_ID', '搜索关键词', 'logger');
```

#### 深度搜索（适合大型文件夹）
```javascript
const results = deepSearch('YOUR_FOLDER_ID', '搜索关键词', 'sheet');
```

#### 性能优化搜索
```javascript
const results = performanceSearch('YOUR_FOLDER_ID', '搜索关键词', 'logger');
```

### 3. 批量搜索

在多个文件夹中搜索相同的关键词：

```javascript
const folderIds = [
  'FOLDER_ID_1',
  'FOLDER_ID_2',
  'FOLDER_ID_3'
];

const results = batchSearch(folderIds, '搜索关键词', 'sheet');
```

### 4. 配置管理

#### 查看当前配置
```javascript
const config = getCurrentConfig();
console.log(config);
```

#### 设置输出格式
```javascript
setDefaultOutputFormat('sheet');  // 或 'logger'
```

#### 设置批量处理大小
```javascript
setDefaultBatchSize(100);
```

#### 启用/禁用增量搜索
```javascript
setIncrementalSearchEnabled(true);  // 或 false
```

#### 自定义配置
```javascript
setSearchConfig({
  search: {
    maxResults: 2000,
    batchSize: 75,
    maxDepth: 30
  },
  output: {
    defaultFormat: 'sheet',
    includeStatistics: true
  },
  incremental: {
    enabled: true,
    defaultBatchSize: 75
  }
});
```

#### 导出和导入配置
```javascript
// 导出配置
const configJson = exportConfig();

// 导入配置
importConfig(configJson);
```

#### 重置为默认配置
```javascript
resetConfig();
```

### 5. 文件类型管理

#### 查看支持的文件类型
```javascript
const types = getSupportedFileTypes();
console.log(types);
```

#### 添加自定义文件类型
```javascript
addCustomFileType('application/custom-type', '自定义文件类型');
```

### 6. 辅助功能

#### 获取文件夹结构
```javascript
const structure = getFolderStructure('YOUR_FOLDER_ID', 3);  // 最大深度3
console.log(structure);
```

#### 获取文件类型统计
```javascript
// 非递归统计
const stats = getFileTypeStatistics('YOUR_FOLDER_ID', false);

// 递归统计
const recursiveStats = getFileTypeStatistics('YOUR_FOLDER_ID', true);
console.log(stats);
```

## 配置选项说明

### 搜索配置 (search)
- `maxResults`: 最大结果数量（默认：1000）
- `batchSize`: 批量处理大小（默认：50）
- `maxDepth`: 最大遍历深度（默认：20）
- `timeoutMinutes`: 超时时间（分钟）（默认：5）
- `enableIncremental`: 是否启用增量搜索（默认：true）

### 输出配置 (output)
- `defaultFormat`: 默认输出格式（'logger' 或 'sheet'）（默认：'logger'）
- `sheetNameTemplate`: Sheet名称模板（默认：'搜索结果_{date}'）
- `includeStatistics`: 是否包含统计信息（默认：true）
- `maxBatchSize`: 最大批量写入大小（默认：100）
- `autoResizeColumns`: 是否自动调整列宽（默认：true）

### 性能配置 (performance)
- `enableMonitoring`: 是否启用性能监控（默认：true）
- `checkpointInterval`: 检查点间隔（默认：100）
- `nearTimeoutThreshold`: 接近超时阈值（默认：0.8）
- `retryAttempts`: 重试次数（默认：3）
- `retryDelay`: 重试延迟（毫秒）（默认：1000）

### 错误处理配置 (errorHandling)
- `skipPermissionErrors`: 是否跳过权限错误（默认：true）
- `skipNetworkErrors`: 是否跳过网络错误（默认：false）
- `logErrorDetails`: 是否记录错误详情（默认：true）
- `continueOnError`: 是否在错误时继续（默认：true）
- `maxErrorsBeforeStop`: 停止前的最大错误数（默认：50）

### 增量搜索配置 (incremental)
- `enabled`: 是否启用（默认：true）
- `defaultBatchSize`: 默认批量大小（默认：50）
- `saveProgressInterval`: 保存进度间隔（默认：100）
- `maxExecutionTime`: 最大执行时间（毫秒）（默认：300000）
- `enableProgressSaving`: 是否启用进度保存（默认：true）

## 支持的文件类型

默认支持以下文件类型：
- Google Docs (application/vnd.google-apps.document)
- PDF (application/pdf)
- Word文档 (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- 文本文件 (text/plain)
- Google Sheets (application/vnd.google-apps.spreadsheet)

## 输出格式

### 控制台输出 (logger)
搜索结果将输出到 Google Apps Script 的日志控制台，包括：
- 搜索摘要信息
- 文件类型统计
- 详细的文件列表（序号、文件名、类型、路径、链接）

### Google Sheet 输出 (sheet)
搜索结果将创建一个新的 Google Sheet，包括：
- 格式化的表格（序号、文件名、文件类型、文件夹路径、文件链接、最后修改时间）
- 汇总信息（总文件数、搜索时间、文件类型统计）
- 自动调整的列宽
- 超链接格式的文件链接

## 错误处理

工具会自动处理以下错误情况：
- **权限错误**：跳过无权限访问的文件/文件夹，继续处理其他文件
- **网络超时**：自动重试（最多3次），使用指数退避策略
- **配额限制**：建议使用增量搜索或等待配额重置
- **执行超时**：自动切换到增量搜索模式

## 性能优化建议

1. **小型文件夹（< 500个文件）**：使用 `quickSearch()`
2. **中型文件夹（500-2000个文件）**：使用标准 `searchGoogleDrive()`
3. **大型文件夹（> 2000个文件）**：使用 `deepSearch()` 或增量搜索
4. **性能优先**：使用 `performanceSearch()` 并增大批量处理大小

## 测试

运行测试函数验证工具功能：

```javascript
testSearchTool();
```

注意：需要在测试函数中设置有效的测试文件夹ID。

## 注意事项

1. **文件夹ID获取**：在 Google Drive 中打开文件夹，URL中的最后一段即为文件夹ID
   - 例如：`https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
   - 文件夹ID为：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

2. **权限要求**：需要对目标文件夹及其内容有读取权限

3. **执行时间限制**：Google Apps Script 有6分钟的执行时间限制，大型文件夹建议使用增量搜索

4. **API配额**：注意 Google Drive API 的使用配额限制

5. **搜索范围**：搜索仅限于指定文件夹及其子文件夹，不包括回收站中的文件

## 示例场景

### 场景1：在项目文件夹中查找包含特定关键词的文档
```javascript
const results = simpleSearch('PROJECT_FOLDER_ID', '需求文档', {
  outputFormat: 'sheet'
});
```

### 场景2：在多个部门文件夹中搜索
```javascript
const departmentFolders = [
  'DEPT_A_FOLDER_ID',
  'DEPT_B_FOLDER_ID',
  'DEPT_C_FOLDER_ID'
];

const results = batchSearch(departmentFolders, '年度报告', 'sheet');
```

### 场景3：大型文档库的深度搜索
```javascript
// 使用深度搜索配置
const results = deepSearch('LARGE_LIBRARY_FOLDER_ID', '技术规范', 'sheet');
```

### 场景4：自定义配置的精确搜索
```javascript
// 设置自定义配置
setSearchConfig({
  search: {
    maxResults: 100,
    batchSize: 25,
    maxDepth: 5
  },
  output: {
    defaultFormat: 'sheet'
  }
});

// 执行搜索
const results = searchGoogleDrive('FOLDER_ID', '关键词');
```

## 故障排除

### 问题：搜索超时
**解决方案**：使用增量搜索或减小搜索范围

### 问题：权限错误
**解决方案**：确保对目标文件夹有读取权限

### 问题：找不到预期的文件
**解决方案**：
1. 确认文件类型是否在支持列表中
2. 检查文件是否在回收站中
3. 验证关键词拼写是否正确

### 问题：配额超限
**解决方案**：等待配额重置（通常24小时）或使用增量搜索减少API调用

## 更多信息

详细的技术文档和设计说明，请参考：
- `requirements.md` - 需求文档
- `design.md` - 设计文档
- `tasks.md` - 实施计划
