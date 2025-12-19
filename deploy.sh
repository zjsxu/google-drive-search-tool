#!/bin/bash

# Google Drive 搜索工具一键部署脚本
# 使用方法：./deploy.sh

echo "🚀 Google Drive 搜索工具一键部署"
echo "=================================="

# 检查 clasp 是否安装
if ! command -v clasp &> /dev/null; then
    echo "❌ clasp 未安装，正在安装..."
    npm install -g @google/clasp
    if [ $? -ne 0 ]; then
        echo "❌ clasp 安装失败，请手动安装：npm install -g @google/clasp"
        exit 1
    fi
fi

echo "✅ clasp 已安装"

# 检查是否已登录
if ! clasp login --status &> /dev/null; then
    echo "🔐 需要登录 Google 账户..."
    clasp login
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
fi

echo "✅ 已登录 Google 账户"

# 创建项目
echo "📁 创建 Google Apps Script 项目..."
clasp create --title "Google Drive 搜索工具" --type standalone

if [ $? -ne 0 ]; then
    echo "❌ 项目创建失败"
    exit 1
fi

echo "✅ 项目创建成功"

# 推送代码
echo "📤 推送代码到 Google Apps Script..."
clasp push

if [ $? -ne 0 ]; then
    echo "❌ 代码推送失败"
    exit 1
fi

echo "✅ 代码推送成功"

# 部署 Web 应用
echo "🌐 部署 Web 应用..."
DEPLOY_OUTPUT=$(clasp deploy --description "自动部署 - $(date)")

if [ $? -ne 0 ]; then
    echo "❌ Web 应用部署失败"
    exit 1
fi

echo "✅ Web 应用部署成功"

# 提取 Web 应用 URL
WEB_APP_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://script.google.com/macros/s/[^/]*/exec')

echo ""
echo "🎉 部署完成！"
echo "=================================="
echo "📋 项目信息："
echo "   - 项目名称: Google Drive 搜索工具"
echo "   - 部署时间: $(date)"
echo ""
echo "🌐 Web 应用地址："
echo "   $WEB_APP_URL"
echo ""
echo "📖 使用说明："
echo "   1. 打开上面的 Web 应用地址"
echo "   2. 输入 Google Drive 文件夹 ID"
echo "   3. 输入搜索关键词"
echo "   4. 选择输出格式"
echo "   5. 点击开始搜索"
echo ""
echo "🔧 管理项目："
echo "   - 查看项目: clasp open"
echo "   - 更新代码: clasp push"
echo "   - 查看日志: clasp logs"
echo ""
echo "✨ 享受使用 Google Drive 搜索工具！"