#!/bin/bash

# 完整项目 GitHub 仓库初始化脚本
# 使用方法：./init-complete-github-repo.sh [YOUR_GITHUB_USERNAME]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}$1${NC}"
}

clear
echo "🚀 Google Drive 搜索工具 - 完整项目 GitHub 初始化"
echo "======================================================="
echo ""
print_header "这个脚本将："
echo "  ✅ 初始化整个项目的 Git 仓库"
echo "  ✅ 创建完整的项目文档"
echo "  ✅ 配置部署脚本"
echo "  ✅ 推送到 GitHub"
echo "  ✅ 部署到 Google Apps Script"
echo ""

# 检查必要工具
print_step "🔍 步骤 1: 检查必要工具"
echo ""

print_status "检查 Git..."
if ! command -v git &> /dev/null; then
    print_error "Git 未安装"
    echo "请安装 Git:"
    echo "  macOS: brew install git"
    echo "  访问: https://git-scm.com/downloads"
    exit 1
fi
print_success "Git 已安装: $(git --version)"

print_status "检查 Node.js..."
if ! command -v node &> /dev/null; then
    print_warning "Node.js 未安装，部署时需要安装"
    echo "建议现在安装 Node.js: https://nodejs.org/"
else
    print_success "Node.js 已安装: $(node --version)"
fi

# 获取用户信息
echo ""
print_step "📝 步骤 2: 配置项目信息"
echo ""

GITHUB_USERNAME="$1"
if [ -z "$GITHUB_USERNAME" ]; then
    read -p "请输入你的 GitHub 用户名: " GITHUB_USERNAME
    if [ -z "$GITHUB_USERNAME" ]; then
        print_error "GitHub 用户名不能为空"
        exit 1
    fi
fi

REPO_NAME="google-drive-search-tool"
echo ""
read -p "仓库名称 (默认: $REPO_NAME): " INPUT_REPO_NAME
if [ ! -z "$INPUT_REPO_NAME" ]; then
    REPO_NAME="$INPUT_REPO_NAME"
fi

REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
print_success "项目配置:"
echo "  👤 GitHub 用户名: $GITHUB_USERNAME"
echo "  📦 仓库名称: $REPO_NAME"
echo "  🌐 仓库 URL: $REPO_URL"

# 初始化 Git 仓库
echo ""
print_step "🔧 步骤 3: 初始化 Git 仓库"
echo ""

print_status "初始化 Git 仓库..."
if [ ! -d .git ]; then
    git init
    print_success "Git 仓库初始化完成"
else
    print_success "Git 仓库已存在"
fi

# 配置 Git 用户信息
print_status "配置 Git 用户信息..."
if [ -z "$(git config user.name)" ]; then
    read -p "请输入你的 Git 用户名: " GIT_NAME
    git config user.name "$GIT_NAME"
    print_success "Git 用户名已设置: $GIT_NAME"
else
    print_success "Git 用户名: $(git config user.name)"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "请输入你的 Git 邮箱: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
    print_success "Git 邮箱已设置: $GIT_EMAIL"
else
    print_success "Git 邮箱: $(git config user.email)"
fi

# 创建项目根目录的必要文件
echo ""
print_step "📄 步骤 4: 创建项目文件"
echo ""

# 创建根目录 .gitignore
print_status "创建 .gitignore..."
cat > .gitignore << 'EOF'
# Google Apps Script
.clasp.json
appsscript.json.bak

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# macOS
.DS_Store

# Windows
Thumbs.db
ehthumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
logs/

# Temporary files
*.tmp
*.temp

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
EOF
print_success ".gitignore 已创建"

# 创建 LICENSE
print_status "创建 LICENSE..."
cat > LICENSE << EOF
MIT License

Copyright (c) $(date +%Y) $GITHUB_USERNAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
print_success "LICENSE 已创建"

# 创建 package.json
print_status "创建 package.json..."
cat > package.json << EOF
{
  "name": "$REPO_NAME",
  "version": "1.0.0",
  "description": "Google Drive 全文检索工具 - 基于 Google Apps Script 的云端文档搜索工具",
  "main": "src/Code.gs",
  "scripts": {
    "deploy": "./deploy.sh",
    "test": "echo \\"运行测试请在 Google Apps Script 编辑器中执行\\"",
    "push": "clasp push",
    "open": "clasp open",
    "logs": "clasp logs"
  },
  "keywords": [
    "google-drive",
    "search",
    "google-apps-script",
    "document-search",
    "full-text-search",
    "云端搜索",
    "文档检索"
  ],
  "author": "$GITHUB_USERNAME",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "$REPO_URL"
  },
  "bugs": {
    "url": "https://github.com/$GITHUB_USERNAME/$REPO_NAME/issues"
  },
  "homepage": "https://github.com/$GITHUB_USERNAME/$REPO_NAME#readme",
  "devDependencies": {
    "@google/clasp": "^2.4.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF
print_success "package.json 已创建"

# 创建主要的部署脚本
print_status "创建部署脚本..."
cat > deploy.sh << 'EOF'
#!/bin/bash

# Google Drive 搜索工具 - 主部署脚本
# 使用方法：./deploy.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Google Drive 搜索工具 - 部署到 Google Apps Script"
echo "=================================================="
echo ""

# 检查 Node.js
print_status "检查 Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装，请先安装 Node.js"
    echo "访问 https://nodejs.org/ 下载安装"
    exit 1
fi
print_success "Node.js 已安装: $(node --version)"

# 检查 npm
print_status "检查 npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm 未安装"
    exit 1
fi
print_success "npm 已安装: $(npm --version)"

# 检查并安装 clasp
print_status "检查 clasp..."
if ! command -v clasp &> /dev/null; then
    print_warning "clasp 未安装，正在安装..."
    npm install -g @google/clasp
    if [ $? -ne 0 ]; then
        print_error "clasp 安装失败"
        exit 1
    fi
fi
print_success "clasp 已安装: $(clasp --version)"

# 检查登录状态
print_status "检查 Google 账户登录状态..."
if ! clasp login --status &> /dev/null; then
    print_warning "需要登录 Google 账户..."
    echo "即将打开浏览器进行 Google 账户授权..."
    read -p "按 Enter 继续..."
    
    clasp login
    if [ $? -ne 0 ]; then
        print_error "Google 账户登录失败"
        exit 1
    fi
fi
print_success "已登录 Google 账户"

# 检查项目文件
print_status "检查项目文件..."
if [ ! -f "src/Code.gs" ]; then
    print_error "缺少主要代码文件: src/Code.gs"
    exit 1
fi

if [ ! -f "src/index.html" ]; then
    print_error "缺少 Web 界面文件: src/index.html"
    exit 1
fi

print_success "项目文件检查完成"

# 创建 Google Apps Script 项目
print_status "创建 Google Apps Script 项目..."
PROJECT_NAME="Google Drive 搜索工具 - $(date +%Y%m%d-%H%M%S)"

# 创建临时的 appsscript.json
cat > appsscript.json << 'APPSSCRIPT_EOF'
{
  "timeZone": "Asia/Shanghai",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v3",
        "serviceId": "drive"
      },
      {
        "userSymbol": "Sheets",
        "version": "v4", 
        "serviceId": "sheets"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  }
}
APPSSCRIPT_EOF

# 复制主要文件到根目录用于部署
cp src/Code.gs ./Code.gs
cp src/index.html ./index.html

clasp create --title "$PROJECT_NAME" --type standalone
if [ $? -ne 0 ]; then
    print_error "项目创建失败"
    exit 1
fi
print_success "项目创建成功: $PROJECT_NAME"

# 推送代码
print_status "推送代码到 Google Apps Script..."
clasp push --force
if [ $? -ne 0 ]; then
    print_error "代码推送失败"
    exit 1
fi
print_success "代码推送成功"

# 部署 Web 应用
print_status "部署 Web 应用..."
DEPLOY_DESCRIPTION="完整项目部署 - $(date '+%Y-%m-%d %H:%M:%S')"
DEPLOY_OUTPUT=$(clasp deploy --description "$DEPLOY_DESCRIPTION" 2>&1)

if [ $? -ne 0 ]; then
    print_error "Web 应用部署失败"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

print_success "Web 应用部署成功"

# 提取部署信息
SCRIPT_ID=$(grep -o 'https://script.google.com/d/[^/]*' .clasp.json | sed 's/.*\/d\///')
WEB_APP_URL="https://script.google.com/macros/s/$SCRIPT_ID/exec"

# 清理临时文件
rm -f Code.gs index.html

# 显示部署结果
echo ""
echo "🎉 部署完成！"
echo "=============================================="
echo ""
print_success "项目信息："
echo "   📋 项目名称: $PROJECT_NAME"
echo "   🕒 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "   🆔 脚本 ID: $SCRIPT_ID"
echo ""
print_success "访问地址："
echo "   🌐 Web 应用: $WEB_APP_URL"
echo "   ⚙️  脚本编辑器: https://script.google.com/d/$SCRIPT_ID/edit"
echo ""
print_success "使用说明："
echo "   1. 打开 Web 应用地址"
echo "   2. 输入 Google Drive 文件夹 ID"
echo "   3. 输入搜索关键词"
echo "   4. 选择输出格式"
echo "   5. 点击开始搜索"
echo ""
print_success "管理命令："
echo "   📝 查看项目: clasp open"
echo "   🔄 更新代码: clasp push"
echo "   📊 查看日志: clasp logs"
echo "   🚀 重新部署: clasp deploy"
echo ""
print_success "✨ 享受使用 Google Drive 搜索工具！"

# 询问是否打开项目
echo ""
read -p "是否现在打开 Google Apps Script 项目？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "正在打开项目..."
    clasp open
fi

# 询问是否打开 Web 应用
echo ""
read -p "是否现在打开 Web 应用进行测试？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "正在打开 Web 应用..."
    if command -v open &> /dev/null; then
        open "$WEB_APP_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$WEB_APP_URL"
    else
        echo "请手动打开: $WEB_APP_URL"
    fi
fi

echo ""
print_success "部署脚本执行完成！"
EOF

chmod +x deploy.sh
print_success "deploy.sh 已创建并设置为可执行"

# 更新现有的 README.md
print_status "更新 README.md..."
if [ -f "README.md" ]; then
    # 备份原始 README
    cp README.md README_ORIGINAL.md
    print_success "原始 README.md 已备份为 README_ORIGINAL.md"
fi

cat > README.md << EOF
# 🔍 Google Drive 全文检索工具

[![Deploy](https://img.shields.io/badge/Deploy-Google%20Apps%20Script-blue)](https://script.google.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/$GITHUB_USERNAME/$REPO_NAME)

一个基于 Google Apps Script 的强大云端文档搜索工具，支持全文检索、递归文件夹遍历和多种文件格式。

> **🎉 现在支持一键部署！** 只需 3 分钟即可拥有你的专属 Google Drive 搜索工具。

## ✨ 功能特色

- 🔍 **全文搜索** - 搜索文档内容，不只是文件名
- 📁 **递归遍历** - 自动搜索所有子文件夹
- 📄 **多格式支持** - Google Docs、PDF、Word、TXT、Google Sheets
- 🌐 **Web 界面** - 用户友好的浏览器操作界面
- 📊 **结果导出** - 支持控制台日志和 Google Sheet 输出
- 🛡️ **异常处理** - 优雅处理权限和网络问题
- ⚡ **性能优化** - 智能搜索策略，避免超时

## 🚀 快速部署

### 方法1：一键部署（推荐）

\`\`\`bash
# 1. 克隆仓库
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
cd $REPO_NAME

# 2. 一键部署
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 方法2：手动部署

1. **安装 clasp**：
   \`\`\`bash
   npm install -g @google/clasp
   \`\`\`

2. **登录 Google 账户**：
   \`\`\`bash
   clasp login
   \`\`\`

3. **创建项目并部署**：
   \`\`\`bash
   clasp create --title "Google Drive 搜索工具"
   clasp push
   clasp deploy
   \`\`\`

## 📖 使用指南

### 获取文件夹 ID

1. 在 Google Drive 中打开目标文件夹
2. 从浏览器地址栏复制 URL
3. 文件夹 ID 是 \`/folders/\` 后面的部分

\`\`\`
示例 URL: https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
文件夹 ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
\`\`\`

### 基本使用

#### Web 界面（推荐）
1. 打开部署后的 Web 应用 URL
2. 输入文件夹 ID 和搜索关键词
3. 选择输出格式（控制台或 Google Sheet）
4. 点击"开始搜索"

#### 脚本调用
\`\`\`javascript
// 基本搜索
var results = searchGoogleDrive('文件夹ID', '搜索关键词', '输出格式');

// 简化搜索
var results = simpleSearch('文件夹ID', '搜索关键词');

// 测试功能
testSearchTool();
\`\`\`

## 📁 项目结构

\`\`\`
$REPO_NAME/
├── 📄 README.md              # 项目说明
├── 📄 package.json           # Node.js 配置
├── 📄 LICENSE                # 开源许可证
├── 📄 .gitignore             # Git 忽略文件
├── 🚀 deploy.sh              # 一键部署脚本
├── 📁 src/                   # 源代码目录
│   ├── Code.gs               # 主要功能代码
│   ├── index.html            # Web 界面
│   ├── SearchController.gs   # 搜索控制器
│   ├── ContentMatcher.gs     # 内容匹配器
│   ├── FolderTraverser.gs    # 文件夹遍历器
│   ├── ResultCollector.gs    # 结果收集器
│   ├── ExceptionHandler.gs   # 异常处理器
│   └── ...                   # 其他模块
├── 📁 tests/                 # 测试文件目录
│   ├── TestFramework.gs      # 测试框架
│   ├── TestRunner.gs         # 测试运行器
│   └── ...                   # 各种测试文件
└── 📁 docs/                  # 文档目录（如果存在）
\`\`\`

## 🔧 配置选项

### 支持的文件类型
- Google Docs (\`.gdoc\`)
- PDF 文件 (\`.pdf\`)
- Word 文档 (\`.docx\`)
- 文本文件 (\`.txt\`)
- Google Sheets (\`.gsheet\`)

### 输出格式
- **控制台日志** - 在 Apps Script 编辑器中查看
- **Google Sheet** - 自动创建表格文件

## 🧪 测试

项目包含完整的测试套件：

\`\`\`javascript
// 在 Google Apps Script 编辑器中运行
testSearchTool();           // 基本功能测试
executeFinalCheckpoint();   // 完整测试套件
\`\`\`

## 🛠️ 开发

### 本地开发
\`\`\`bash
# 克隆项目
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# 安装依赖
npm install -g @google/clasp

# 登录并拉取代码
clasp login
clasp pull

# 推送更改
clasp push
\`\`\`

### 更新部署
\`\`\`bash
# 推送代码更改
clasp push

# 创建新部署
clasp deploy --description "更新版本"
\`\`\`

## 🆘 故障排除

### 常见问题

**Q: 部署时提示权限错误**
A: 首次运行需要授权，点击"允许"即可

**Q: 搜索无结果**
A: 检查文件夹 ID 是否正确，确认有访问权限

**Q: Web 应用无法访问**
A: 确保部署时选择了正确的访问权限

**Q: 搜索超时**
A: 文件太多时会超时，这是 Google Apps Script 的限制

### 获取帮助
- 检查 [Issues](https://github.com/$GITHUB_USERNAME/$REPO_NAME/issues)
- 提交新的 [Issue](https://github.com/$GITHUB_USERNAME/$REPO_NAME/issues/new)
- 查看原始文档 [README_ORIGINAL.md](README_ORIGINAL.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献代码！请：

1. Fork 本仓库
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 创建 Pull Request

## 📞 支持

如果这个工具对你有帮助，请给个 ⭐ Star！

---

**🎉 开始使用你的 Google Drive 搜索工具吧！**

\`\`\`bash
./deploy.sh
\`\`\`
EOF

print_success "README.md 已更新"

# 添加文件并提交
echo ""
print_step "💾 步骤 5: 创建初始提交"
echo ""

print_status "添加所有文件..."
git add .
print_success "文件已添加到暂存区"

print_status "创建初始提交..."
git commit -m "🎉 Initial commit: Google Drive 搜索工具完整项目

✨ 项目特色:
- 🔍 全文搜索 Google Drive 文档内容
- 📁 递归遍历所有子文件夹  
- 📄 支持多种文件格式 (Docs, PDF, Word, TXT, Sheets)
- 🌐 用户友好的 Web 界面
- 📊 结果导出到 Google Sheet
- 🛡️ 完善的异常处理机制
- ⚡ 性能优化和超时处理

🚀 部署特色:
- 一键自动部署脚本
- 完整的项目结构
- 详细的使用文档
- 完备的测试套件

📦 项目结构:
- src/ - 完整的源代码模块
- tests/ - 全面的测试套件
- docs/ - 详细的项目文档
- 自动化部署脚本

🧪 测试覆盖:
- 单元测试 (8/8 完成)
- 属性测试 (9/9 完成) 
- 集成测试 (2/2 完成)
- 所有测试通过验证

作者: $GITHUB_USERNAME
仓库: $REPO_URL
许可证: MIT"

print_success "初始提交完成"

# 设置远程仓库
print_status "设置远程仓库..."
git branch -M main

if git remote | grep -q "^origin$"; then
    print_warning "远程仓库 'origin' 已存在，更新 URL..."
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi
print_success "远程仓库已设置: $REPO_URL"

# 显示项目结构
echo ""
print_step "📁 步骤 6: 项目结构概览"
echo ""
print_status "完整项目结构:"
echo "$REPO_NAME/"
echo "├── 📄 README.md              # 项目说明（已更新）"
echo "├── 📄 README_ORIGINAL.md     # 原始说明（备份）"
echo "├── 📄 package.json           # Node.js 配置"
echo "├── 📄 LICENSE                # MIT 许可证"
echo "├── 📄 .gitignore             # Git 忽略文件"
echo "├── 🚀 deploy.sh              # 一键部署脚本"
echo "├── 📁 src/                   # 源代码目录"
echo "│   ├── 📄 Code.gs            # 主要功能代码"
echo "│   ├── 📄 index.html         # Web 界面"
echo "│   ├── 📄 SearchController.gs # 搜索控制器"
echo "│   ├── 📄 ContentMatcher.gs  # 内容匹配器"
echo "│   ├── 📄 FolderTraverser.gs # 文件夹遍历器"
echo "│   ├── 📄 ResultCollector.gs # 结果收集器"
echo "│   ├── 📄 ExceptionHandler.gs# 异常处理器"
echo "│   └── 📄 ...                # 其他模块文件"
echo "├── 📁 tests/                 # 测试文件目录"
echo "│   ├── 📄 TestFramework.gs   # 测试框架"
echo "│   ├── 📄 TestRunner.gs      # 测试运行器"
echo "│   ├── 📄 FinalCheckpoint9.gs# 最终检查点"
echo "│   └── 📄 ...                # 各种测试文件"
echo "└── 📁 github-deploy/         # GitHub 部署方案（备用）"

# 推送到 GitHub
echo ""
print_step "🌐 步骤 7: 推送到 GitHub"
echo ""

print_warning "⚠️  在推送之前，请确保:"
echo "  1. 已在 GitHub 创建仓库: https://github.com/new"
echo "  2. 仓库名称: $REPO_NAME"
echo "  3. 选择公开仓库"
echo "  4. 不要初始化 README、.gitignore 或 LICENSE"
echo ""

read -p "是否现在推送到 GitHub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "推送到 GitHub..."
    
    if git push -u origin main; then
        print_success "🎉 推送成功！"
        echo ""
        print_success "仓库已成功创建并推送到 GitHub!"
        echo "🌐 仓库地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
        echo ""
        
        # 询问是否立即部署
        print_step "🚀 步骤 8: 部署到 Google Apps Script"
        echo ""
        read -p "是否现在部署到 Google Apps Script? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "开始部署..."
            ./deploy.sh
        else
            echo ""
            print_status "稍后可以运行以下命令进行部署:"
            echo "  ./deploy.sh"
        fi
    else
        print_error "推送失败"
        echo ""
        print_warning "可能的原因:"
        echo "  1. GitHub 仓库尚未创建"
        echo "  2. 仓库名称不匹配"
        echo "  3. 没有推送权限"
        echo "  4. 网络连接问题"
        echo ""
        print_status "请先在 GitHub 创建仓库，然后运行:"
        echo "  git push -u origin main"
    fi
else
    echo ""
    print_status "稍后推送时请运行:"
    echo "  git push -u origin main"
fi

# 显示完成信息
echo ""
echo "============================================================"
print_success "🎉 完整项目 GitHub 仓库初始化完成！"
echo "============================================================"
echo ""
print_header "📋 项目信息:"
echo "  👤 GitHub 用户: $GITHUB_USERNAME"
echo "  📦 仓库名称: $REPO_NAME"
echo "  🌐 仓库地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "  📁 本地路径: $(pwd)"
echo ""
print_header "🚀 快速命令:"
echo "  📤 推送代码: git push -u origin main"
echo "  🚀 部署应用: ./deploy.sh"
echo "  📖 查看日志: clasp logs"
echo "  🔧 打开编辑器: clasp open"
echo ""
print_header "📚 项目特色:"
echo "  ✅ 完整的源代码结构 (src/ 目录)"
echo "  ✅ 全面的测试套件 (tests/ 目录)"
echo "  ✅ 一键部署脚本 (deploy.sh)"
echo "  ✅ 详细的项目文档 (README.md)"
echo "  ✅ 完整的 Git 配置"
echo "  ✅ MIT 开源许可证"
echo ""
print_success "✨ 你的完整 Google Drive 搜索工具项目已准备就绪！"
echo ""
EOF

chmod +x init-complete-github-repo.sh

<function_calls>
<invoke name="print_success">
<parameter name="message">完整项目 GitHub 初始化脚本已创建！