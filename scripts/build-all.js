// 整合打包脚本：构建前端 + 拷贝后端 + 输出 dist 集成目录
// 项目结构: 根目录 = server (src/) + web/
// 产物结构:
//   dist/
//     src/                后端源码
//     public/             前端构建产物 (来自 web/dist)
//     package.json        后端依赖清单
//     .env.example
//     ecosystem.config.js PM2 配置
//     README.md           部署说明
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const WEB = path.join(ROOT, 'web');
const SRC = path.join(ROOT, 'src');

// 终端日志
const log = (msg) => console.log(`[build-all] ${msg}`);
const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });

// 递归拷贝目录 (跳过 node_modules / dist / .git)
function copyDir(src, dest, skip = ['node_modules', 'dist', '.git']) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.includes(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d, skip) : fs.copyFileSync(s, d);
  }
}

// 清空 dist (保留已配置的 dist/.env，避免每次重新部署都要 cp)
const distEnv = path.join(DIST, '.env');
let preservedEnv = null;
if (fs.existsSync(distEnv)) {
  preservedEnv = fs.readFileSync(distEnv, 'utf8');
  log('检测到已存在的 dist/.env，将保留配置');
}

if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 1. 构建前端
log('开始构建前端 (web)...');
run(`npm run build --prefix web`, { cwd: ROOT });
const webDist = path.join(WEB, 'dist');
if (!fs.existsSync(webDist)) {
  throw new Error('前端构建产物 web/dist 不存在');
}

// 2. 拷贝后端源码到 dist/src
log('拷贝后端源码到 dist/src...');
copyDir(SRC, path.join(DIST, 'src'));

// 3. 拷贝前端产物到 dist/public
log('拷贝前端产物到 dist/public...');
copyDir(webDist, path.join(DIST, 'public'));

// 4. 拷贝后端配置文件 (package.json 仅保留 dependencies + 必要字段)
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const serverPkg = {
  name: 'tarkov-map-server',
  version: rootPkg.version,
  description: '逃离塔科夫互动地图后端服务 (Express + WebSocket)',
  private: true,
  main: 'src/index.js',
  scripts: {
    start: 'node src/index.js',
  },
  dependencies: rootPkg.dependencies,
  engines: rootPkg.engines,
};
fs.writeFileSync(
  path.join(DIST, 'package.json'),
  JSON.stringify(serverPkg, null, 2),
);
fs.copyFileSync(
  path.join(ROOT, '.env.example'),
  path.join(DIST, '.env.example'),
);

// 4.1 还原已保留的 .env (避免每次部署重新配置)
if (preservedEnv !== null) {
  fs.writeFileSync(distEnv, preservedEnv);
  log('已还原 dist/.env');
}

// 5. 拷贝 PM2 配置 (调整 cwd 指向 dist 根)
const pm2Config = `// PM2 进程管理配置
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
`;
fs.writeFileSync(path.join(DIST, 'ecosystem.config.js'), pm2Config);

// 6. 部署说明
const readme = `# 部署说明

## 目录结构
\`\`\`
dist/
  src/                后端源码
  public/             前端静态资源
  package.json        后端依赖清单
  .env.example
  ecosystem.config.js PM2 配置
\`\`\`

## 首次部署

1. 上传整个 dist 目录至服务器 (Node.js >= 16)
2. 配置后端环境变量:
   \`\`\`bash
   cd dist
   cp .env.example .env
   # 编辑 .env: 填写 PORT / SSL_KEY_PATH / SSL_CERT_PATH
   # USE_HTTP 保持注释，生产用 HTTPS
   \`\`\`
3. 安装后端依赖:
   \`\`\`bash
   cd dist
   npm install --production
   \`\`\`
4. 启动服务 (PM2):
   \`\`\`bash
   pm2 start ecosystem.config.js
   \`\`\`
   或直接启动:
   \`\`\`bash
   npm start
   \`\`\`

## 后续更新部署

打包脚本自动保留 dist/.env 配置。

1. 本地重新打包: \`npm run build:all\`
2. 上传 dist/ 覆盖服务器目录
3. 服务器重启: \`pm2 restart tarkov-ws\`

## 本地调试 (无 SSL 证书)

在 .env 中设置:
\`\`\`
USE_HTTP=1
\`\`\`
将以 HTTP 模式启动，跳过 SSL 校验。

## 前端访问路径

前端构建 base 为 \`/tar-im/\`，访问: https://your-host:PORT/tar-im/
`;
fs.writeFileSync(path.join(DIST, 'README.md'), readme);

log('打包完成 -> dist/');
log('部署: 上传 dist/ 至服务器, 执行 npm install --production 后 pm2 start ecosystem.config.js');
