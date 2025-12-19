# 🔍 Google Drive 全文检索工具

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://zjsxu.github.io/google-drive-search-tool/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Ready-yellow)](https://script.google.com)

基于 Google Apps Script 的强大云端文档搜索工具，支持全文检索、递归文件夹遍历和多种文件格式。

> **🌐 在线访问：** [https://zjsxu.github.io/google-drive-search-tool/](https://zjsxu.github.io/google-drive-search-tool/)

## 🌟 主要特性

- **🔍 全文检索**：支持Google Docs、PDF、Word、TXT、Google Sheets等多种文件格式
- **📁 递归搜索**：自动遍历文件夹及其所有子文件夹
- **🌐 Web界面**：友好的网页界面，无需编程知识即可使用
- **⚡ 增量搜索**：处理大型文件夹时自动分批执行，避免超时
- **📊 多种输出**：支持控制台日志和Google Sheet表格两种输出格式
- **🛡️ 异常处理**：自动处理权限错误、网络超时等异常情况
- **⚙️ 灵活配置**：支持自定义搜索参数和性能优化设置

## 🚀 快速开始

### 方法1：使用在线指南（推荐）

访问 **[在线部署指南](https://zjsxu.github.io/google-drive-search-tool/)** 获取详细的图文教程。

### 方法2：命令行部署

```bash
# 1. 克隆仓库
git clone https://github.com/zjsxu/google-drive-search-tool.git
cd google-drive-search-tool

# 2. 安装 clasp
npm install -g @google/clasp

# 3. 登录 Google 账户
clasp login

# 4. 创建 Google Apps Script 项目
clasp create --title "Google Drive 搜索工具" --type standalone

# 5. 复制主要文件
cp src/Code.gs ./Code.gs
cp src/index.html ./index.html

# 6. 推送代码并部署
clasp push
clasp deploy
```

### 使用脚本函数

```javascript
// 简单搜索
const results = simpleSearch('YOUR_FOLDER_ID', '搜索关键词');

// 输出到Google Sheet
const results = searchGoogleDrive('YOUR_FOLDER_ID', '搜索关键词', 'sheet');
```

## 📁 项目结构

```
├── appsscript.json              # Google Apps Script 配置文件
├── src/                         # 源代码目录
│   ├── Code.gs                 # 主入口文件和Web应用函数
│   ├── index.html              # Web应用界面
│   ├── styles.html             # 样式文件
│   ├── scripts.html            # JavaScript功能
│   ├── SearchController.gs     # 搜索控制器
│   ├── ContentMatcher.gs       # 内容匹配器
│   ├── FolderTraverser.gs      # 文件夹遍历器
│   ├── ResultCollector.gs      # 结果收集器
│   ├── ExceptionHandler.gs     # 异常处理器
│   ├── ConfigurationManager.gs # 配置管理器
│   ├── PerformanceMonitor.gs   # 性能监控器
│   ├── IncrementalSearchManager.gs # 增量搜索管理器
│   └── interfaces/             # 接口定义
│       └── DataModels.gs       # 核心数据模型
├── tests/                      # 测试目录
│   ├── TestFramework.gs        # 测试框架
│   ├── *Test.gs               # 各组件测试文件
│   └── TestRunner.gs          # 测试运行器
├── INSTALLATION.md             # 安装指南
├── USAGE.md                   # 使用指南
├── EXAMPLES.md                # 使用示例
└── DEPLOYMENT.md              # 部署指南
```

## 核心数据模型

### SearchResult
搜索结果数据结构，包含：
- `fileName`: 文件名称
- `fileUrl`: 文件访问链接
- `folderPath`: 文件完整路径
- `fileType`: 文件类型
- `lastModified`: 最后修改时间

### FileMatch
文件匹配数据结构，包含：
- `file`: Google Drive 文件对象
- `parentPath`: 父级路径信息

### SearchConfiguration
搜索配置数据结构，包含：
- `folderId`: 目标文件夹ID
- `keyword`: 搜索关键词
- `maxResults`: 最大结果数量（可选）
- `includeFileTypes`: 包含的文件类型（可选）
- `outputFormat`: 输出格式（'logger' 或 'sheet'）

## API 权限配置

项目已配置以下 Google API 权限：
- `https://www.googleapis.com/auth/drive.readonly` - 读取 Drive 文件
- `https://www.googleapis.com/auth/drive.file` - 访问特定文件
- `https://www.googleapis.com/auth/spreadsheets` - 创建和编辑表格

## 测试框架

项目包含完整的测试框架：
- **TestSuite**: 测试套件管理
- **Assert**: 断言函数库
- **PropertyTestGenerator**: 属性测试生成器

### 运行测试

```javascript
// 运行所有测试
runCompleteTestSuite();

// 仅运行单元测试
runAllUnitTests();

// 仅运行属性测试
runAllPropertyTests();

// 验证项目结构
validateProjectStructure();
```

## 📖 文档指南

- **[安装指南](INSTALLATION.md)** - 详细的安装和配置步骤
- **[使用指南](USAGE.md)** - Web界面和脚本函数的完整使用说明
- **[使用示例](EXAMPLES.md)** - 常见场景的具体使用示例
- **[部署指南](DEPLOYMENT.md)** - 高级部署选项和配置

## 🎯 使用方法

### Web应用界面

1. 打开部署的Web应用URL
2. 输入Google Drive文件夹ID
3. 输入搜索关键词
4. 选择输出格式（控制台日志或Google Sheet）
5. 点击"开始搜索"

### 脚本函数调用

```javascript
// 基本搜索
const results = simpleSearch('your-folder-id', 'search-keyword');

// 指定输出格式
const results = searchGoogleDrive('your-folder-id', 'search-keyword', 'sheet');

// 增量搜索（适用于大型文件夹）
const result = searchGoogleDriveIncremental('your-folder-id', 'keyword', 'logger');

// 批量搜索多个文件夹
const results = batchSearch(['folder-id-1', 'folder-id-2'], 'keyword', 'sheet');
```

## 📋 支持的文件类型

- **Google Docs** (application/vnd.google-apps.document)
- **PDF文件** (application/pdf)
- **Word文档** (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- **纯文本** (text/plain)
- **Google Sheets** (application/vnd.google-apps.spreadsheet)

## ⚙️ 主要功能

### 搜索功能
- ✅ 全文内容搜索
- ✅ 递归文件夹遍历
- ✅ 多文件类型支持
- ✅ 增量搜索（处理大型文件夹）
- ✅ 批量搜索多个文件夹

### 输出功能
- ✅ 控制台日志输出
- ✅ Google Sheet表格输出
- ✅ 详细的搜索统计信息
- ✅ 文件直接访问链接

### 用户界面
- ✅ Web应用界面
- ✅ 实时搜索进度显示
- ✅ 高级搜索选项
- ✅ 错误提示和处理

### 配置管理
- ✅ 自定义搜索参数
- ✅ 性能优化设置
- ✅ 错误处理配置
- ✅ 配置导入导出

### 异常处理
- ✅ 权限错误自动跳过
- ✅ 网络超时重试机制
- ✅ API配额限制处理
- ✅ 用户友好的错误信息

## 🔧 配置选项

工具提供丰富的配置选项：

```javascript
// 设置搜索配置
setSearchConfig({
  search: {
    maxResults: 1000,      // 最大结果数量
    batchSize: 50,         // 批量处理大小
    maxDepth: 20,          // 最大遍历深度
    timeoutMinutes: 5      // 超时时间（分钟）
  },
  output: {
    defaultFormat: 'logger',  // 默认输出格式
    includeStatistics: true   // 包含统计信息
  },
  incremental: {
    enabled: true,            // 启用增量搜索
    defaultBatchSize: 50      // 增量搜索批量大小
  }
});
```

## 🚀 性能特性

- **智能批处理**：自动调整批量大小以优化性能
- **增量搜索**：大型文件夹自动分批处理，避免超时
- **性能监控**：实时监控执行时间和资源使用
- **缓存机制**：减少重复API调用
- **错误恢复**：自动重试和错误跳过机制

## 🛡️ 安全特性

- **权限控制**：仅访问必要的Google Drive权限
- **数据隐私**：不存储用户数据，仅在搜索时临时访问
- **错误隔离**：单个文件错误不影响整体搜索
- **访问日志**：详细的操作日志记录

## 📊 开发状态

✅ **已完成功能**
- 项目结构和核心接口
- 搜索控制器核心逻辑
- Drive API查询和内容匹配
- 递归文件夹遍历
- 异常处理和错误管理
- 结果收集和输出格式化
- 性能优化和增量搜索
- 组件集成和主入口
- Web应用界面
- 完整的测试框架

🎯 **当前任务**
- 用户界面和文档完善
- 最终测试和验证

## 🤝 贡献指南

欢迎贡献代码和建议！请查看以下资源：

- 需求文档：`.kiro/specs/google-drive-search-tool/requirements.md`
- 设计文档：`.kiro/specs/google-drive-search-tool/design.md`
- 实施计划：`.kiro/specs/google-drive-search-tool/tasks.md`

## 📄 许可证

本项目仅供学习和个人使用。使用时请遵守Google服务条款和相关法律法规。

## 🆘 技术支持

如果遇到问题，请提供以下信息：
- 错误信息截图
- 使用的文件夹ID（可脱敏）
- 搜索关键词
- 配置设置
- 执行日志

## 🔗 相关链接

- [Google Apps Script](https://script.google.com/)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google Sheets API](https://developers.google.com/sheets/api)