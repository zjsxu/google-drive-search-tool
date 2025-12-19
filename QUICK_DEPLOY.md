# 🚀 Google Drive 搜索工具 - 一键部署指南

## 快速部署（5分钟搞定）

### 方法1：使用 clasp 自动部署（推荐）

#### 前提条件
```bash
# 安装 Node.js 和 clasp
npm install -g @google/clasp
```

#### 一键部署命令
```bash
# 1. 登录 Google 账户
clasp login

# 2. 克隆项目并部署
git clone [你的项目地址]
cd google-drive-search-tool
clasp create --title "Google Drive 搜索工具" --type standalone
clasp push
clasp deploy --description "Web应用部署"

# 3. 打开项目
clasp open
```

### 方法2：单文件快速部署

#### 步骤1：创建 Google Apps Script 项目
1. 访问 [script.google.com](https://script.google.com)
2. 点击"新建项目"
3. 重命名为"Google Drive 搜索工具"

#### 步骤2：配置项目设置
1. 点击左侧"项目设置"
2. 勾选"显示 appsscript.json 清单文件"
3. 将 appsscript.json 替换为以下内容：

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

#### 步骤3：复制核心代码
将 `ALL_IN_ONE_DEPLOY.gs` 文件的内容复制到 Code.gs 中

#### 步骤4：添加 Web 界面
创建 HTML 文件 "index"，复制 `WEB_INTERFACE.html` 的内容

#### 步骤5：部署 Web 应用
1. 点击"部署" → "新建部署"
2. 类型选择"Web 应用"
3. 执行身份：我
4. 访问权限：任何人
5. 点击"部署"
6. 复制 Web 应用 URL

### 方法3：GitHub 风格一键部署

我将创建一个部署脚本，让你可以像使用 GitHub Pages 一样部署：

#### 使用部署脚本
```bash
# 下载部署脚本
curl -O https://raw.githubusercontent.com/[你的仓库]/deploy.sh
chmod +x deploy.sh

# 一键部署
./deploy.sh
```

## 🎯 部署后测试

### 快速测试步骤
1. 打开 Web 应用 URL
2. 输入测试数据：
   - 文件夹 ID：你的 Google Drive 文件夹 ID
   - 关键词：test
3. 点击"开始搜索"
4. 查看结果

### 获取文件夹 ID
在 Google Drive 中打开文件夹，从 URL 复制 ID：
```
https://drive.google.com/drive/folders/[这里是文件夹ID]
```

## 🔧 故障排除

### 常见问题
1. **权限错误**：首次运行需要授权
2. **API 未启用**：确保 Google Drive API 已启用
3. **文件夹访问**：确保有文件夹查看权限

### 支持的文件类型
- Google Docs
- PDF 文件
- Word 文档 (.docx)
- 文本文件 (.txt)
- Google Sheets

## 📞 技术支持

如果遇到问题，请检查：
1. 浏览器控制台错误信息
2. Apps Script 执行日志
3. 文件夹 ID 是否正确
4. 网络连接是否正常

---

**🎉 部署完成后，你就可以通过 Web 界面搜索 Google Drive 文件了！**