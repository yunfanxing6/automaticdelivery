# 检查 tar 命令是否存在
if (-not (Get-Command tar -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到 tar 命令。请确保你的 Windows 版本是最新的 (Win10/11 自带 tar)。" -ForegroundColor Red
    exit 1
}

Write-Host "正在打包项目 (自动排除 node_modules 等大文件夹)..." -ForegroundColor Green

# 执行打包
# 注意: Windows tar 对 exclude 的处理可能与 Linux 略有不同，这里使用通用的模式
tar -czf deploy.tar.gz --exclude "node_modules" --exclude ".git" --exclude "client/dist" --exclude "server/dist" --exclude "server/prisma/dev.db" *

if (Test-Path "deploy.tar.gz") {
    $size = (Get-Item "deploy.tar.gz").Length / 1MB
    Write-Host "------------------------------------------------"
    Write-Host "打包成功！" -ForegroundColor Green
    Write-Host "文件: deploy.tar.gz"
    Write-Host "大小: $([math]::Round($size, 2)) MB"
    Write-Host "------------------------------------------------"
    Write-Host "接下来的步骤:"
    Write-Host "1. 上传 deploy.tar.gz 到服务器 (例如 /opt/automaticdelivery)"
    Write-Host "2. 在服务器执行解压: tar -xzf deploy.tar.gz"
    Write-Host "3. 运行部署脚本: ./deploy.sh"
} else {
    Write-Host "打包失败，请检查错误信息。" -ForegroundColor Red
}
