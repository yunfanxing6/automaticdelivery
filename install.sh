#!/bin/bash

# 确保脚本在出错时停止
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}   咸鱼自动发货系统 一键安装脚本 (GitHub版)${NC}"
echo -e "${GREEN}===========================================${NC}"

# 1. 检查必要工具
check_cmd() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}错误: 未检测到 $1，请先安装。${NC}"
        echo "Ubuntu/Debian: sudo apt update && sudo apt install -y $1"
        exit 1
    fi
}

check_cmd git
check_cmd docker

# 2. 确定安装目录
INSTALL_DIR="/opt/automaticdelivery"
REPO_URL="https://github.com/yunfanxing6/automaticdelivery.git"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}检测到目录 $INSTALL_DIR 已存在，准备更新...${NC}"
    cd "$INSTALL_DIR"
    git pull
else
    echo -e "${GREEN}正在克隆项目到 $INSTALL_DIR ...${NC}"
    
    sudo git clone "$REPO_URL" "$INSTALL_DIR" || {
        echo -e "${RED}克隆失败，请检查网络或 GitHub 地址是否正确。${NC}"
        exit 1
    }
    cd "$INSTALL_DIR"
fi

# 3. 启动服务
echo -e "${GREEN}正在启动 Docker 服务...${NC}"
if docker compose version &> /dev/null; then
    sudo docker compose up -d --build
else
    sudo docker-compose up -d --build
fi

# 4. 检查状态
sleep 5
echo -e "${GREEN}服务状态:${NC}"
if docker compose version &> /dev/null; then
    sudo docker compose ps
else
    sudo docker-compose ps
fi

# 5. 获取公网 IP (仅供参考)
IP=$(curl -s ifconfig.me || echo "localhost")

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}   安装完成！${NC}"
echo -e "请访问: http://${IP}:3000"
echo -e "管理命令:"
echo -e "  cd $INSTALL_DIR"
echo -e "  docker-compose logs -f  (查看日志)"
echo -e "  docker-compose restart  (重启服务)"
echo -e "${GREEN}===========================================${NC}"
