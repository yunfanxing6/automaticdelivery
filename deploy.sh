#!/bin/bash

# 打印带颜色的输出
green() {
  echo -e "\033[32m$1\033[0m"
}

red() {
  echo -e "\033[31m$1\033[0m"
}

# 确保脚本在出错时停止
set -e

echo "=================================="
echo "   咸鱼自动发货系统部署脚本"
echo "=================================="

# 1. 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    red "错误：未找到 docker-compose.yml 文件！"
    echo "请确保你已经进入了项目文件夹，例如："
    echo "cd /opt/automaticdelivery"
    exit 1
fi

# 2. 检查 Docker 环境
if ! command -v docker &> /dev/null; then
    red "错误：未检测到 Docker，请先安装 Docker。"
    exit 1
fi

# 3. 执行部署
green "正在构建并启动服务..."
# 尝试使用新版 docker compose 命令，如果失败则回退到 docker-compose
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d --build
    else
        red "错误：未找到 docker-compose 插件。"
        exit 1
    fi
fi

# 4. 检查运行状态
green "正在检查服务状态..."
sleep 5
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo ""
green "部署成功！"
echo "请在浏览器访问: http://服务器IP:3000"
echo "进入【系统设置】->【启动驱动】进行扫码登录。"
