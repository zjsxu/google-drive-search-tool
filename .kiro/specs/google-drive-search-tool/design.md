# 设计文档

## 概述

Google Drive全文检索自动化工具是一个基于Google Apps Script的轻量级解决方案，旨在提供高效的云端文档搜索能力。该工具通过Drive API实现深度递归搜索，支持多种文件格式的全文检索，并生成结构化的搜索结果报告。

## 架构

### 系统架构
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   用户界面      │───▶│  搜索引擎核心    │───▶│   结果输出      │
│ (GAS Web App)   │    │ (Search Engine)  │    │ (Logger/Sheet)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Google Drive   │
                       │      API         │
                       └──────────────────┘
```

### 核心组件
1. **搜索控制器 (SearchController)**: 协调整个搜索流程
2. **文件夹遍历器 (FolderTraverser)**: 实现递归文件夹遍历
3. **内容匹配器 (ContentMatcher)**: 执行全文搜索匹配
4. **结果收集器 (ResultCollector)**: 收集和格式化搜索结果
5. **异常处理器 (ExceptionHandler)**: 处理权限和网络异常

## 组件和接口

### SearchController
```javascript
class SearchController {
  search(folderId: string, keyword: string): SearchResult[]
  validateInputs(folderId: string, keyword: string): boolean
  initializeSearch(): void
}
```

### FolderTraverser
```javascript
class FolderTraverser {
  traverseFolder(folderId: string, keyword: string): FileMatch[]
  getSubfolders(folderId: string): Folder[]
  processFolder(folder: Folder, keyword: string): FileMatch[]
}
```

### ContentMatcher
```javascript
class ContentMatcher {
  searchFilesInFolder(folderId: string, keyword: string): File[]
  buildSearchQuery(folderId: string, keyword: string): string
  validateFileAccess(file: File): boolean
}
```

### ResultCollector
```javascript
class ResultCollector {
  collectResult(file: File, folderPath: string): SearchResult
  formatResults(results: SearchResult[]): FormattedOutput
  outputToLogger(results: SearchResult[]): void
  outputToSheet(results: SearchResult[]): void
}
```

## 数据模型

### SearchResult
```javascript
interface SearchResult {
  fileName: string;
  fileUrl: string;
  folderPath: string;
  fileType: string;
  lastModified: Date;
}
```

### FileMatch
```javascript
interface FileMatch {
  file: GoogleAppsScript.Drive.File;
  parentPath: string;
}
```

### SearchConfiguration
```javascript
interface SearchConfiguration {
  folderId: string;
  keyword: string;
  maxResults?: number;
  includeFileTypes?: string[];
  outputFormat: 'logger' | 'sheet';
}
```

## 正确性属性

*属性是应该在系统的所有有效执行中保持为真的特征或行为——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性反思

在分析所有可测试属性后，我识别出以下冗余情况需要合并：
- 属性2.1和2.2关于递归遍历的规则可以合并为一个综合属性
- 属性1.4和1.5关于结果格式的规则可以合并为结果完整性属性
- 属性5.1和5.2关于搜索范围的规则可以合并为范围限制属性

### 核心正确性属性

**属性 1: 搜索执行完整性**
*对于任何*有效的文件夹ID和搜索关键词，系统应该执行完整的搜索操作并返回结果
**验证: 需求 1.1**

**属性 2: 文件类型支持完整性**
*对于任何*支持的文件类型（Google Docs、PDF、Word、TXT、Google Sheets），系统应该能够检索其内部文本内容
**验证: 需求 1.2**

**属性 3: 搜索准确性**
*对于任何*文件，当且仅当文件内容包含搜索关键词时，该文件应该出现在搜索结果中
**验证: 需求 1.3**

**属性 4: 结果完整性**
*对于任何*匹配的文件，搜索结果应该包含文件名、访问链接和完整的父级路径信息
**验证: 需求 1.4, 1.5, 2.4**

**属性 5: 递归遍历完整性**
*对于任何*包含子文件夹的文件夹，系统应该递归遍历所有子文件夹并搜索其中的文件
**验证: 需求 2.1, 2.2, 2.3**

**属性 6: 异常处理稳定性**
*对于任何*权限受限或无法访问的文件，系统应该跳过该文件并继续处理其他文件而不中断整个搜索过程
**验证: 需求 3.1, 3.3**

**属性 7: 错误信息有效性**
*对于任何*搜索过程中发生的错误，系统应该提供清晰有意义的错误信息
**验证: 需求 3.4**

**属性 8: 增量搜索策略**
*对于任何*文件数量超过预设阈值的搜索操作，系统应该自动采用增量搜索策略
**验证: 需求 4.2**

**属性 9: 输出格式支持**
*对于任何*搜索操作，系统应该支持控制台日志和Google Sheet两种输出格式
**验证: 需求 4.4, 4.5**

**属性 10: 搜索范围限制**
*对于任何*指定的文件夹ID，搜索结果应该仅包含该文件夹及其子文件夹内的文件，且排除回收站中的文件
**验证: 需求 5.1, 5.2, 5.4**

**属性 11: 输入验证**
*对于任何*提供的文件夹ID，系统应该验证其有效性和用户访问权限
**验证: 需求 5.3**

## 错误处理

### 异常类型和处理策略

1. **权限异常 (Permission Errors)**
   - 检测：捕获Drive API权限相关异常
   - 处理：记录警告信息，跳过受限文件，继续处理
   - 恢复：无需恢复，正常流程继续

2. **网络超时 (Network Timeouts)**
   - 检测：API调用超时异常
   - 处理：实施指数退避重试机制（最多3次）
   - 恢复：重试失败后跳过当前操作

3. **配额限制 (Quota Exceeded)**
   - 检测：Drive API配额超限异常
   - 处理：暂停执行，记录当前进度
   - 恢复：提供增量搜索机制从上次中断点继续

4. **无效输入 (Invalid Input)**
   - 检测：文件夹ID格式验证失败
   - 处理：立即返回错误信息，不执行搜索
   - 恢复：要求用户提供有效输入

5. **执行时间超限 (Execution Timeout)**
   - 检测：接近GAS 6分钟执行限制
   - 处理：保存当前结果，设置继续执行标记
   - 恢复：支持分批执行和结果合并

## 测试策略

### 双重测试方法

本项目采用单元测试和基于属性的测试相结合的综合测试策略：

**单元测试**覆盖：
- 特定的搜索场景和边界条件
- API集成点的正确性验证
- 错误处理逻辑的具体实现
- 输出格式化功能的准确性

**基于属性的测试**覆盖：
- 搜索准确性的通用属性验证
- 递归遍历的完整性保证
- 异常处理的稳定性验证
- 输入输出的一致性检查

### 基于属性的测试配置

- **测试框架**: 使用Google Apps Script的内置测试功能结合自定义属性测试实现
- **测试迭代**: 每个属性测试运行最少100次迭代以确保随机输入覆盖
- **测试标记**: 每个基于属性的测试必须包含注释，明确引用设计文档中的正确性属性
- **标记格式**: `**Feature: google-drive-search-tool, Property {number}: {property_text}**`

### 测试数据生成策略

1. **文件夹结构生成器**: 创建具有不同深度和文件类型的随机文件夹结构
2. **关键词生成器**: 生成各种长度和复杂度的搜索关键词
3. **文件内容生成器**: 创建包含或不包含目标关键词的随机文件内容
4. **权限场景生成器**: 模拟不同的文件访问权限组合

### 性能和集成测试

- **性能基准**: 验证在不同文件数量下的执行时间
- **API集成**: 测试与Google Drive API的实际交互
- **端到端验证**: 完整搜索流程的集成测试
