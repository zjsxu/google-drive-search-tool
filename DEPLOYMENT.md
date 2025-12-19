# 部署指南

## 如何将项目部署到 Google Apps Script

### 方法 1: 使用 clasp (推荐)

1. **安装 clasp**
   ```bash
   npm install -g @google/clasp
   ```

2. **登录 Google 账户**
   ```bash
   clasp login
   ```

3. **创建新项目**
   ```bash
   clasp create --title "Google Drive Search Tool" --type standalone
   ```

4. **推送代码到 Google Apps Script**
   ```bash
   clasp push
   ```

5. **在浏览器中打开项目**
   ```bash
   clasp open
   ```

### 方法 2: 手动复制

1. 访问 [Google Apps Script](https://script.google.com/)
2. 创建新项目
3. 将以下文件内容复制到对应的脚本文件中：
   - `appsscript.json` → 项目设置
   - `src/Code.gs` → Code.gs
   - `src/interfaces/DataModels.gs` → DataModels.gs
   - `tests/TestFramework.gs` → TestFramework.gs
   - `tests/DataModelsTest.gs` → DataModelsTest.gs
   - `tests/TestRunner.gs` → TestRunner.gs

### 启用 Drive API

1. 在 Google Apps Script 编辑器中，点击左侧的"服务"（Services）
2. 找到"Google Drive API"并添加
3. 选择 v3 版本

### 授权权限

首次运行时，系统会要求授权以下权限：
- 查看和管理 Google Drive 文件
- 创建和编辑 Google Sheets

### 运行测试

在 Google Apps Script 编辑器中：
1. 选择函数 `validateProjectStructure`
2. 点击运行按钮
3. 查看日志输出验证项目结构

## 项目文件说明

### 核心文件
- `appsscript.json`: 项目配置和 API 权限
- `src/Code.gs`: 主入口文件
- `src/interfaces/DataModels.gs`: 数据模型定义

### 测试文件
- `tests/TestFramework.gs`: 测试框架实现
- `tests/DataModelsTest.gs`: 数据模型测试
- `tests/TestRunner.gs`: 测试运行器

## 下一步

项目结构已完成，可以继续实现：
1. 搜索控制器核心逻辑
2. Drive API 查询和内容匹配
3. 递归文件夹遍历
4. 异常处理和错误管理
5. 结果收集和输出格式化

参考 `.kiro/specs/google-drive-search-tool/tasks.md` 查看完整实施计划。