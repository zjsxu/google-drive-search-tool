# 🚀 一键部署指南

## 最简单的部署方式（推荐）

### 只需复制 2 个文件！

#### 文件清单
1. **ALL_IN_ONE_CORE.gs** - 所有核心代码（复制到 Code.gs）
2. **WEB_INTERFACE.html** - Web 界面（复制到 index.html）
3. **appsscript.json** - 配置文件（替换项目配置）

---

## 📋 详细步骤

### 第一步：创建项目
1. 访问 [script.google.com](https://script.google.com)
2. 点击"新建项目"
3. 重命名为"Google Drive 搜索工具"

### 第二步：添加代码
1. **Code.gs**：
   - 删除默认代码
   - 打开 `ALL_IN_ONE_CORE.gs`
   - 全选复制（Ctrl+A, Ctrl+C）
   - 粘贴到 Code.gs（Ctrl+V）

2. **index.html**：
   - 点击"+" → HTML 文件
   - 命名为"index"
   - 打开 `WEB_INTERFACE.html`
   - 全选复制
   - 粘贴到 index.html

3. **appsscript.json**：
   - 点击左侧"项目设置"
   - 勾选"显示 appsscript.json 清单文件"
   - 打开 `appsscript.json`
   - 全选复制
   - 粘贴替换项目的 appsscript.json

### 第三步：保存和部署
1. 点击"保存"（Ctrl+S）
2. 点击"部署" → "新建部署"
3. 类型：Web 应用
4. 配置：
   ```
   说明: Google Drive 搜索工具 v1.0
   执行身份: 我
   访问权限: 任何人
   ```
5. 点击"部署"
6. 复制 Web 应用 URL

### 第四步：测试
1. 打开 Web 应用 URL
2. 输入测试数据：
   - 文件夹 ID：从 Google Drive URL 复制
   - 关键词：test
3. 点击"开始搜索"

---

## 🎯 快速测试

### 获取文件夹 ID
```
Google Drive URL:
https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

文件夹 ID:
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

### 测试搜索
```
文件夹 ID: [你的文件夹ID]
关键词: test
输出格式: 控制台日志
```

---

## 🔧 使用 clasp 自动部署（可选）

如果你熟悉命令行：

```bash
# 安装 clasp
npm install -g @google/clasp

# 登录
clasp login

# 创建项目
clasp create --title "Google Drive 搜索工具" --type standalone

# 推送代码
clasp push

# 部署
clasp deploy --description "Web应用"

# 打开项目
clasp open
```

---

## ✨ 功能特色

- 🔍 **全文搜索** - 搜索文档内容
- 📁 **递归遍历** - 自动搜索子文件夹
- 📄 **多格式支持** - Docs, PDF, Word, TXT, Sheets
- 🌐 **Web 界面** - 浏览器操作
- 📊 **结果导出** - 控制台或 Google Sheet
- 🛡️ **异常处理** - 优雅处理错误

---

## 🆘 常见问题

**Q: 权限错误**
A: 首次运行点击"允许"授权

**Q: 无搜索结果**
A: 检查文件夹 ID 和访问权限

**Q: 部署失败**
A: 确保所有文件都已正确复制

**Q: Web 应用无法访问**
A: 检查部署时的访问权限设置

---

## 📞 技术支持

遇到问题？检查：
1. 浏览器控制台（F12）
2. Apps Script 执行日志
3. 文件夹 ID 格式
4. Google Drive API 状态

---

**🎉 部署完成！开始使用你的 Google Drive 搜索工具吧！**

这个工具可以帮你在海量文档中快速找到需要的内容，大大提高工作效率！