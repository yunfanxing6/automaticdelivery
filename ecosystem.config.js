module.exports = {
  apps: [
    {
      name: 'auto-delivery-server',
      script: './dist/index.js',
      cwd: './server',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // 如果服务器安装了 Chromium，这里可以指定路径
        // PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser' 
      },
      env_file: '../.env'
    }
  ]
};
