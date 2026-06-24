# 逃离塔科夫互动地图

前后端整合 monorepo 仓库。

## 目录结构

```
tarkovMap/                    # 根目录 = 后端服务 (Express + WebSocket)
├── package.json              # 后端依赖 + 前后端编排脚本
├── ecosystem.config.js       # PM2 部署配置
├── .env.example              # 后端环境变量模板
├── scripts/
│   └── build-all.js          # 整合打包脚本 (前端 + 后端 → dist/)
├── src/                      # 后端源码
│   ├── index.js              # 入口: HTTPS/HTTP + WS 启动 (支持 USE_HTTP 回退)
│   ├── app.js                # Express 实例 (含前端静态托管)
│   ├── config/               # 配置
│   ├── routes/               # 路由
│   ├── controllers/          # 控制器
│   ├── middlewares/          # 中间件
│   ├── services/             # 业务服务 (wsService / bossService)
│   └── utils/                # 工具
├── web/                      # 前端 (Vite + React + TS)
│   ├── package.json
│   ├── vite.config.ts        # 含 /api + /ws 代理至本地 8001
│   ├── .env.development      # 本地 WS 地址 (走 Vite 代理)
│   └── src/
└── README.md
```

## 脚本说明

| 命令                       | 说明 |
|--------------------------|---|
| `yarn install:all`       | 安装根 (后端) + web 前端依赖 |
| `yarn dev`               | 同时启动前后端 (concurrently 并行) |
| `yarn dev:web`           | 仅启动前端 Vite dev server (端口 5173, HMR) |
| `yarn dev:server`        | 仅启动后端 (端口 8001) |
| `yarn build`             | 仅构建前端 → `web/dist/` |
| `yarn build:all`         | 整合打包: 前端构建 + 后端源码 → `dist/` (上传服务器用) |
| `yarn start`             | 启动后端生产服务 |
| `yarn lint` / `yarn fix` | 前端代码检查/修复 |

## 本地开发

```bash
# 1. 安装所有依赖
yarn install:all

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

## 整合打包部署

服务器 Node.js >= 16，无需安装前端依赖。

### 首次部署 

```bash
# 1. 本地打包 (生成 dist/ 集成目录，默认生产模式 USE_HTTP 注释)
yarn build:all

# 2. 上传 dist/ 整个目录至服务器

# 3. 服务器首次配置后端环境变量 (后续部署无需重复)
cd dist
cp .env.example .env
# 编辑 .env 填入:
#   PORT=8001
#   SSL_KEY_PATH=/path/to/cert.key
#   SSL_CERT_PATH=/path/to/cert.pem
#   NODE_ENV=production
#   # USE_HTTP=1   # 保持注释，生产用 HTTPS

# 4. 安装后端生产依赖
cd dist
yarn install --production

# 5. PM2 启动
pm2 start ecosystem.config.js
```

### 后续更新部署

打包脚本自动保留 `dist/.env` 配置，无需每次重新 cp。

```bash
# 1. 本地重新打包
yarn build:all

# 2. 上传 dist/ 覆盖服务器目录 (保留 .env)

# 3. 服务器重启
pm2 restart tarkov-ws
```

### dist 产物结构

```
dist/
├── package.json             # 后端依赖清单
├── ecosystem.config.js      # PM2 配置
├── README.md                # 部署说明
├── .env.example
├── src/                     # 后端源码
└── public/                  # 前端构建产物 (由 web/dist 拷贝)
```

## 后端 HTTP 接口

- `GET /api/health`     健康检查
- `GET /api/status`     WebSocket 客户端数与缓存状态
- `GET /api/bosses`     Boss 刷新率数据
- `POST /api/bosses/refresh`  手动刷新 Boss 缓存

## 前端访问路径

前端构建 base 为 `/tar-im/`，访问: `https://your-host:PORT/tar-im/`

根路径 `/` 自动重定向至 `/tar-im/`，SPA history fallback 由后端 Express 处理。

## WebSocket 协议

- 心跳: 客户端发 `{ "type": "ping" }`，服务端回 `{ "type": "pong" }`
- 业务消息: `{ "category": "boss|line|clearLines|...", "value": {...} }`
- 广播消息: `{ "type": "broadcast", "data": { "category": "...", "value": {...} } }`
- 连接建立后立即推送: 全量绘图缓存 + Boss 刷新缓存

## 注意点

1. **服务器 Node 版本**: >= 16，无需更高
2. **SSL 证书**: 生产必填，本地调试设 `USE_HTTP=1` 跳过
3. **前端 base 路径**: `/tar-im/`，部署路径需匹配
4. **WS URL**: 前端由 `VITE_WS_URL` 驱动，开发用本地代理，生产 fallback 至 `wss://www.gzvirdyn.cn:8001`
