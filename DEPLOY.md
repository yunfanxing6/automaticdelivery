# 咸鱼自动发货系统 (Docker版)

本项目包含后端 (Node.js + Puppeteer) 和前端 (React)，通过 Docker Compose 一键部署。

## 部署步骤

### 1. 准备服务器
你需要一台安装了 Docker 和 Docker Compose 的 Linux 服务器 (推荐 Ubuntu)。

### 2. 上传代码
将整个项目文件夹上传到服务器，或使用 Git 克隆。

### 3. 启动服务
在项目根目录运行以下命令：

```bash
docker-compose up -d --build
```

等待构建完成后，服务将自动启动。

### 4. 访问与配置
1. 打开浏览器访问 `http://服务器IP:3000`
2. 进入 "系统设置" 页面
3. 点击 "启动驱动"
4. 使用手机淘宝/闲鱼 APP 扫描页面上显示的二维码登录
5. 登录成功后，系统将自动开始轮询订单并自动发货

## 常用维护命令

- **查看日志**: `docker-compose logs -f`
- **重启服务**: `docker-compose restart`
- **停止服务**: `docker-compose down`
- **更新代码后重新部署**: `docker-compose up -d --build`

## 注意事项
- 首次运行时会自动创建 SQLite 数据库文件。
- 登录状态可能会过期，如果发现发货停止，请去后台重新扫码登录。
