#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}   咸鱼自动发货系统 手动安装脚本 (PM2版)${NC}"
echo -e "${GREEN}===========================================${NC}"

# 1. 安装 Node.js (如果未安装)
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}正在安装 Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 2. 安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}正在安装 PM2...${NC}"
    sudo npm install -g pm2
fi

# 3. 安装 Chromium (用于 Puppeteer)
echo -e "${GREEN}正在安装 Chromium...${NC}"
sudo apt-get install -y chromium-browser

# 4. 安装项目依赖
echo -e "${GREEN}正在安装项目依赖...${NC}"

# Server
cd server
npm install
npm run build
npx prisma generate
npx prisma db push
cd ..

# Client
cd client
npm install
npm run build
cd ..

# 5. 启动服务
echo -e "${GREEN}正在启动服务...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}   安装完成！${NC}"
echo -e "请配置 Nginx 将 3000 端口转发到 80 端口，或者直接访问 http://服务器IP:3000"
echo -e "${GREEN}===========================================${NC}"
