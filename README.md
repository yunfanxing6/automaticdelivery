# 咸鱼自动发货系统 (XianYu Auto Delivery)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-supported-green.svg)

基于 Node.js + React + Puppeteer 的咸鱼/淘宝自动发货系统。无需 API Key，通过扫码登录实现 24 小时无人值守发货。

## ✨ 功能特性

- **自动发货**: 实时监控新订单，匹配关键词自动发送卡密。
- **无需 API**: 内置 Puppeteer 浏览器，模拟人工扫码登录。
- **Web 管理**: 现代化 React 仪表盘，支持手机端操作。
- **Docker 部署**: 纯净环境，一键启动。

## 🚀 快速开始 (One-Line Install)

在你的 Ubuntu/Debian 服务器上执行以下命令即可一键安装：

```bash
curl -O https://raw.githubusercontent.com/yunfanxing6/automaticdelivery/main/install.sh && sudo bash install.sh
```

## 🛠️ 手动部署

1. 克隆仓库
   ```bash
   git clone https://github.com/yunfanxing6/automaticdelivery.git
   cd automaticdelivery
   ```

2. 启动服务
   ```bash
   docker-compose up -d --build
   ```

3. 访问后台
   打开浏览器访问 `http://服务器IP:3000`

## 📦 开发指南

### 后端 (Server)
- 目录: `server/`
- 技术栈: Node.js, Express, Prisma (SQLite), Puppeteer
- 运行: `npm run dev`

### 前端 (Client)
- 目录: `client/`
- 技术栈: React, Vite, TailwindCSS
- 运行: `npm run dev`

## 📝 License

[MIT](LICENSE) © 2024 Your Name
