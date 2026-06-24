# 逃离塔科夫互动地图

前后端整合仓库。

## 脚本说明

| 命令             | 说明 |
|----------------|---|
| `yarn i:all`   | 安装根 (后端) + web 前端依赖 |
| `yarn dev`     | 同时启动前后端|
| `yarn dev:web` | 仅启动前端|
| `yarn dev:server` | 仅启动后端|
| `yarn build:web` | 仅构建前端|
| `yarn build`   | 整合打包: 前端构建 + 后端源码|
| `yarn start`   | 启动后端生产服务 |
| `yarn lint` / `yarn fix` | 前端代码检查/修复 |

## 本地开发

```bash
# 1. 安装所有依赖
yarn i:all

# 2. 配置后端环境变量 (本地调试用 HTTP 模式)
cp .env.example .env
# 编辑 .env:
#   PORT=8001
#   USE_HTTP=1          # 跳过 SSL, HTTP 模式启动
#   NODE_ENV=development

# 3. 同时启动前后端 (HMR 热更新)
yarn dev
```

访问入口:
- 前端: http://localhost:5173/tar-im/
- 后端 API: http://localhost:8001/api/
- WebSocket: ws://localhost:5173/ws (Vite 代理至 8001)


### 部署

```bash
# 1. 本地打包 (生成 dist/ 集成目录，默认生产模式 USE_HTTP 注释)
yarn build

# 2. 上传 dist/ 整个目录至服务器

# 3. 安装后端生产依赖
cd dist
yarn install --production

# 4. PM2 启动
pm2 start ecosystem.config.js
```
