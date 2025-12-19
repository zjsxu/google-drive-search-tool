# 🚀 Google Drive 搜索工具 - 一键部署

## 方法1：超级简单部署（推荐）

### 只需 3 步，5 分钟搞定！

#### 步骤1：创建 Google Apps Script 项目
1. 打开 [script.google.com](https://script.google.com)
2. 点击"新建项目"
3. 重命名为"Google Drive 搜索工具"

#### 步骤2：复制粘贴代码
1. **替换 Code.gs**：
   - 删除默认代码
   - 复制 `ALL_IN_ONE_CORE.gs` 的全部内容
   - 粘贴到 Code.gs 中

2. **添加 Web 界面**：
   - 点击"+"添加文件 → HTML 文件
   - 命名为"index"
   - 复制 `WEB_INTERFACE.html` 的全部内容
   - 粘贴到 index.html 中

3. **配置权限**：
   - 点击左侧"项目设置"
   - 勾选"显示 appsscript.json 清单文件"
   - 将 appsscript.json 替换为：

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

#### 步骤3：部署 Web 应用
1. 点击"保存"
2. 点击"部署" → "新建部署"
3. 类型选择"Web 应用"
4. 配置：
   - 说明：Google Drive 搜索工具 v1.0
   - 执行身份：我
   - 访问权限：任何人（或根据需要选择）
5. 点击"部署"
6. 复制 Web 应用 URL
7. 🎉 完成！

---

## 方法2：命令行自动部署

### 前提条件
```bash
# 安装 Node.js 和 clasp
npm install -g @google/clasp
```

### 一键部署
```bash
# 1. 下载部署脚本
curl -O https://raw.githubusercontent.com/[项目地址]/deploy.sh
chmod +x deploy.sh

# 2. 运行部署脚本
./deploy.sh

# 3. 按提示完成授权
# 4. 获得 Web 应用 URL
```

---

## 🎯 立即测试

### 获取文件夹 ID
1. 在 Google Drive 中打开任意文件夹
2. 从浏览器地址栏复制 URL
3. 文件夹 ID 是 `/folders/` 后面的部分

例如：
```
URL: https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
文件夹 ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

### 测试搜索
1. 打开 Web 应用 URL
2. 输入文件夹 ID
3. 输入关键词（如"project"、"test"）
4. 选择输出格式
5. 点击"开始搜索"

---

## 🔧 功能特色

- ✅ **全文搜索**：搜索文档内容，不只是文件名
- ✅ **多格式支持**：Google Docs、PDF、Word、TXT、Sheets
- ✅ **递归搜索**：自动搜索所有子文件夹
- ✅ **Web 界面**：用户友好的浏览器界面
- ✅ **结果导出**：支持控制台和 Google Sheet 输出
- ✅ **异常处理**：优雅处理权限和网络问题

---

## 🆘 故障排除

### 常见问题

**Q: 部署时提示权限错误**
A: 首次运行需要授权，点击"允许"即可

**Q: 搜索无结果**
A: 检查文件夹 ID 是否正确，确认有访问权限

**Q: Web 应用无法访问**
A: 确保部署时选择了正确的访问权限

**Q: 搜索超时**
A: 文件太多时会超时，这是正常现象

### 获取帮助
- 查看浏览器控制台错误信息
- 检查 Apps Script 执行日志
- 确认 Google Drive API 已启用

---

## 📚 使用示例

### 搜索项目文档
```
文件夹 ID: 1ABC...XYZ
关键词: 项目计划
输出: Google Sheet
```

### 搜索会议记录
```
文件夹 ID: 1DEF...UVW
关键词: 会议纪要
输出: 控制台日志
```

---

**🎉 恭喜！你现在拥有了一个强大的 Google Drive 搜索工具！**

这个工具可以帮你快速在大量文档中找到需要的内容，大大提高工作效率。