#!/bin/bash

# Emby Proxy Pages 快速配置脚本

echo "🎬 Emby Proxy - Cloudflare Pages Functions"
echo "=========================================="
echo ""

# 检查是否已安装 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装："
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 询问 Emby 服务器地址
echo "📝 请输入你的 Emby 服务器地址"
echo "   示例: https://emby.example.com:8096"
echo "   或: http://192.168.1.100:8096"
echo ""
read -p "Emby 服务器地址: " EMBY_SERVER

if [ -z "$EMBY_SERVER" ]; then
    echo "❌ 服务器地址不能为空"
    exit 1
fi

echo ""
echo "🔧 正在配置..."

# 修改配置文件
sed -i.bak "s|const EMBY_SERVER = 'https://your-emby-server.com:8096';|const EMBY_SERVER = '$EMBY_SERVER';|g" functions/\[\[path\]\].js

if [ $? -eq 0 ]; then
    echo "✅ 配置文件已更新"
    rm -f functions/\[\[path\]\].js.bak
else
    echo "❌ 配置失败，请手动编辑 functions/[[path]].js"
    exit 1
fi

echo ""
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo ""
echo "✅ 配置完成！"
echo ""
echo "📋 下一步操作："
echo ""
echo "1️⃣  本地测试（可选）："
echo "   npm run dev"
echo "   然后访问 http://localhost:8788"
echo ""
echo "2️⃣  部署到 Cloudflare Pages："
echo "   方式 A - 通过 Git（推荐）："
echo "     git init"
echo "     git add ."
echo "     git commit -m 'Initial commit'"
echo "     # 推送到 GitHub/GitLab"
echo "     # 然后在 Cloudflare Dashboard 连接仓库"
echo ""
echo "   方式 B - 直接部署："
echo "     npm run deploy"
echo ""
echo "📖 详细部署步骤请查看: DEPLOY.md"
echo ""
