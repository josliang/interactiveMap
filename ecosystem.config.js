// PM2 进程管理配置
// 使用: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'tarkov-ws',
      script: './src/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/ws-error.log',
      out_file: './logs/ws-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
