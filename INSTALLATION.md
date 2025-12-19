# Google Drive 全文检索工具安装指南

## 概述

本指南将帮助您完整安装和配置Google Drive全文检索工具，包括Web应用界面的部署。

## 前提条件

- Google账户
- Google Drive访问权限
- 基本的Google Apps Script使用经验（可选）

## 安装步骤

### 方法1：使用clasp命令行工具（推荐开发者）

#### 1. 安装Node.js和clasp
```bash
# 安装Node.js (如果尚未安装)
# 访问 https://nodejs.org/ 下载安装

# 安装clasp
npm install -g @google/clasp
```

#### 2. 登录Google账户
```bash
clasp login
```

#### 3. 克隆或下载项目代码
```bash
# 如果使用Git
git clone [项目仓库URL]
cd google-drive-search-tool

# 或者下载ZIP文件并解压
```

#### 4. 创建Google Apps Script项目
```bash
clasp create --title "Google Drive 全文检索工具" --type standalone
```

#### 5. 推送代码到Google Apps Script
```bash
clasp push
```

#### 6. 打开项目进行配置
```bash
clasp open
```

### 方法2：手动安装（推荐普通用户）

#### 1. 创建Google Apps Script项目
1. 访问 [Google Apps Script](https://script.google.com/)
2. 点击"新建项目"
3. 将项目重命名为"Google Drive 全文检索工具"

#### 2. 复制项目文件

**步骤A：配置项目设置**
1. 点击左侧的"项目设置"
2. 点击"显示appsscript.json清单文件"
3. 将以下内容复制到appsscript.json：

```json
{
  "timeZone": "Asia/Shanghai",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v3",
        "serviceId": "drive"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

**步骤B：添加主代码文件**
1. 将默认的"Code.gs"文件内容替换为`src/Code.gs`的内容
2. 创建新文件"DataModels.gs"，复制`src/interfaces/DataModels.gs`的内容
3. 创建新文件"SearchController.gs"，复制`src/SearchController.gs`的内容
4. 创建新文件"ContentMatcher.gs"，复制`src/ContentMatcher.gs`的内容
5. 创建新文件"FolderTraverser.gs"，复制`src/FolderTraverser.gs`的内容
6. 创建新文件"ExceptionHandler.gs"，复制`src/ExceptionHandler.gs`的内容
7. 创建新文件"ResultCollector.gs"，复制`src/ResultCollector.gs`的内容
8. 创建新文件"ConfigurationManager.gs"，复制`src/ConfigurationManager.gs`的内容
9. 创建新文件"PerformanceMonitor.gs"，复制`src/PerformanceMonitor.gs`的内容
10. 创建新文件"IncrementalSearchManager.gs"，复制`src/IncrementalSearchManager.gs`的内容

**步骤C：添加Web应用界面文件**
1. 创建新HTML文件"index"，复制`src/index.html`的内容
2. 创建新HTML文件"styles"，复制`src/styles.html`的内容
3. 创建新HTML文件"scripts"，复制`src/scripts.html`的内容

**步骤D：添加测试文件（可选）**
1. 创建新文件"TestFramework.gs"，复制`tests/TestFramework.gs`的内容
2. 创建其他测试文件...

#### 3. 启用Google Drive API
1. 在Apps Script编辑器中，点击左侧的"服务"
2. 找到"Google Drive API"
3. 点击"添加"，选择版本"v3"

#### 4. 保存项目
点击"保存"按钮保存所有更改

## 配置和测试

### 1. 基本功能测试

#### 测试脚本功能
1. 在Apps Script编辑器中选择函数`testSearchTool`
2. 修改函数中的测试文件夹ID：
   ```javascript
   const testFolderId = 'YOUR_ACTUAL_FOLDER_ID_HERE';
   ```
3. 点击"运行"按钮
4. 首次运行时会要求授权，点击"审核权限"
5. 按照提示完成授权流程
6. 查看执行日志确认功能正常

#### 获取文件夹ID的方法
1. 在Google Drive中打开目标文件夹
2. 从浏览器地址栏复制URL
3. 文件夹ID是URL中`/folders/`后面的部分
   - 例如：`https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
   - 文件夹ID：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 2. Web应用部署

#### 部署步骤
1. 在Apps Script编辑器中点击右上角的"部署"
2. 选择"新建部署"
3. 在"类型"中选择"Web应用"
4. 配置部署设置：
   - **说明**：输入版本说明（如"初始版本"）
   - **执行身份**：选择"我"
   - **访问权限**：根据需要选择
     - "仅限我自己"：只有您可以访问
     - "任何人"：任何人都可以访问（推荐团队使用）
     - "域内的任何人"：仅限您的Google Workspace域内用户

5. 点击"部署"
6. 复制生成的Web应用URL
7. 在新浏览器标签页中打开URL测试

#### Web应用测试
1. 打开Web应用URL
2. 输入测试文件夹ID
3. 输入测试关键词（如"test"）
4. 选择输出格式
5. 点击"开始搜索"
6. 验证搜索结果是否正确显示

### 3. 权限配置

#### 必需权限说明
- **Google Drive只读权限**：读取文件夹和文件信息
- **Google Drive文件权限**：访问特定文件内容
- **Google Sheets权限**：创建和编辑搜索结果表格

#### 权限授权流程
1. 首次运行时系统会显示权限请求
2. 点击"允许"授予必要权限
3. 如果显示"此应用未经验证"警告：
   - 点击"高级"
   - 点击"转至[项目名称]（不安全）"
   - 这是正常的，因为这是您自己的项目

## 使用配置

### 1. 基本配置

#### 默认设置
工具使用以下默认配置：
- 最大搜索结果：1000个
- 批量处理大小：50个
- 最大遍历深度：20层
- 输出格式：控制台日志
- 增量搜索：启用

#### 自定义配置
可以通过以下函数修改配置：

```javascript
// 设置输出格式
setDefaultOutputFormat('sheet');

// 设置批量大小
setDefaultBatchSize(100);

// 启用增量搜索
setIncrementalSearchEnabled(true);

// 自定义完整配置
setSearchConfig({
  search: {
    maxResults: 2000,
    batchSize: 75,
    maxDepth: 30
  },
  output: {
    defaultFormat: 'sheet',
    includeStatistics: true
  }
});
```

### 2. 高级配置

#### 性能优化配置
```javascript
// 性能优先配置
setSearchConfig({
  performance: {
    enableMonitoring: true,
    checkpointInterval: 50,
    nearTimeoutThreshold: 0.8
  },
  search: {
    batchSize: 100,
    maxResults: 5000
  }
});
```

#### 错误处理配置
```javascript
// 错误处理配置
setSearchConfig({
  errorHandling: {
    skipPermissionErrors: true,
    continueOnError: true,
    maxErrorsBeforeStop: 100
  }
});
```

## 常见问题解决

### 安装问题

**问题：无法创建Apps Script项目**
- 确保您有Google账户并已登录
- 检查是否有Google Apps Script的访问权限
- 尝试使用无痕模式或清除浏览器缓存

**问题：代码复制后出现语法错误**
- 确保完整复制所有代码，包括开头和结尾
- 检查是否有特殊字符被错误转换
- 尝试使用纯文本编辑器中转

**问题：无法启用Google Drive API**
- 确保项目已保存
- 刷新页面后重试
- 检查Google Cloud Console中的API配额

### 权限问题

**问题：授权时显示"此应用未经验证"**
- 这是正常现象，因为这是您的个人项目
- 点击"高级" → "转至[项目名称]（不安全）"
- 继续授权流程

**问题：无法访问某些文件夹**
- 确保您对目标文件夹有查看权限
- 检查文件夹是否在回收站中
- 尝试使用文件夹所有者的账户

### 功能问题

**问题：搜索结果为空**
- 验证文件夹ID是否正确
- 检查关键词拼写
- 确认文件类型在支持列表中

**问题：搜索超时**
- 启用增量搜索功能
- 减小批量处理大小
- 缩小搜索范围

## 更新和维护

### 更新代码
1. 使用clasp：`clasp push`
2. 手动更新：在Apps Script编辑器中修改代码并保存

### 重新部署Web应用
1. 修改代码后需要重新部署
2. 点击"部署" → "管理部署"
3. 点击现有部署旁的编辑图标
4. 选择新版本并更新

### 备份项目
1. 定期导出项目代码
2. 使用clasp：`clasp pull`
3. 手动复制：从Apps Script编辑器复制代码

## 技术支持

### 日志查看
- 在Apps Script编辑器中点击"执行"查看运行日志
- Web应用错误会显示在浏览器控制台中

### 性能监控
- 使用内置的性能监控功能
- 查看搜索统计信息
- 监控API使用配额

### 问题报告
如果遇到问题，请提供以下信息：
- 错误信息截图
- 使用的文件夹ID（可脱敏）
- 搜索关键词
- 配置设置
- 执行日志

## 下一步

安装完成后，您可以：
1. 阅读 [使用指南](USAGE.md) 了解详细功能
2. 查看 [部署指南](DEPLOYMENT.md) 了解高级部署选项
3. 参考项目的需求文档和设计文档了解技术细节

## 许可证和免责声明

本工具仅供学习和个人使用。使用时请遵守Google服务条款和相关法律法规。