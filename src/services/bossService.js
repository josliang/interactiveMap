// Boss 刷新率服务：拉取上游 API、过滤白名单、定时轮询、缓存
const https = require('https');
const logger = require('../utils/logger');

const BOSS_API_URL = 'https://api.eftarkov.com/boss.php?id=1';
const POLL_INTERVAL = 3 * 60 * 1000; // 3 分钟
const REQUEST_TIMEOUT = 10000;       // 10 秒

// Boss 白名单：API 英文名 → 前端显示名
// Black Div. Boss / Black Div. Raider / Black Div. 统一合并为"黑色军团"
// Tagilla 原样显示；仅 Shadow of Tagilla 译为"牛头大锤"
const BOSS_WHITELIST = {
  Tagilla: 'Tagilla',
  'Shadow of Tagilla': '牛头大锤',
  Reshala: 'Reshala',
  Shturman: 'Shturman',
  Sanitar: 'Sanitar',
  Killa: 'Killa',
  Glukhar: 'Glukhar',
  Zryachiy: 'Zryachiy',
  Kaban: 'Kaban',
  Kollontay: 'Kollontay',
  Knight: '三狗',
  Partisan: 'Partisan',
  Raider: 'Raider',
  Rogue: 'Rogue',
  'Cultist Priest': '邪教徒',
  'Black Div. Boss': '黑色军团',
  'Black Div. Raider': '黑色军团',
  'Black Div.': '黑色军团',
  'The Wedge': 'Wedge',
};

// API 地图名 → normalizedName（前端用 kebab-case 匹配）
// 移除 + 等非字母数字字符，统一为前端 kebab-case 形式
function toNormalizedName (name) {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

class BossService {
  constructor () {
    this.cache = { maps: [], updatedAt: 0 };
    this.timer = null;
    this.onRefresh = null;
    this.isRunning = false;
    this.fetching = false;
  }

  // 请求上游接口（强制 Host + Origin 头）
  fetchBosses () {
    return new Promise((resolve, reject) => {
      const url = new URL(BOSS_API_URL);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          Host: url.hostname,
          Origin: 'https://www.eftarkov.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Accept: 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error('解析 JSON 失败: ' + err.message));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(REQUEST_TIMEOUT, () => {
        req.destroy(new Error('请求超时'));
      });
      req.end();
    });
  }

  // 过滤 + 合并 (按 displayName 去重：Black Div. Boss/Raider 合并为"黑色军团")
  transform (rawData) {
    // 上游返回结构: { category, raw_api_data: { data: { maps: [...] } } }
    const rawMaps = rawData?.raw_api_data?.data?.maps || rawData?.data?.maps || [];
    const maps = rawMaps.map((map) => {
      const bossMap = new Map();
      for (const boss of map.bosses || []) {
        if (!(boss.name in BOSS_WHITELIST)) continue;
        const displayName = BOSS_WHITELIST[boss.name];
        if (!bossMap.has(displayName)) {
          bossMap.set(displayName, {
            name: boss.name,
            displayName,
            spawnChance: boss.spawnChance,
            spawnLocations: [...(boss.spawnLocations || [])],
          });
        } else {
          const existing = bossMap.get(displayName);
          // 取较大刷新率作为合并后刷新率
          if (boss.spawnChance > existing.spawnChance) {
            existing.spawnChance = boss.spawnChance;
          }
          for (const loc of boss.spawnLocations || []) {
            if (!existing.spawnLocations.some((l) => l.name === loc.name)) {
              existing.spawnLocations.push(loc);
            }
          }
        }
      }
      return {
        name: map.name,
        normalizedName: toNormalizedName(map.name),
        bosses: Array.from(bossMap.values()),
      };
    });
    return { maps, updatedAt: Date.now() };
  }

  async refresh () {
    if (this.fetching) return;
    this.fetching = true;
    try {
      const raw = await this.fetchBosses();
      this.cache = this.transform(raw);
      logger.info(`[Boss] 数据刷新成功，地图数: ${this.cache.maps.length}`);
      if (this.onRefresh) this.onRefresh(this.cache);
    } catch (err) {
      logger.error('[Boss] 刷新失败:', err.message);
    } finally {
      this.fetching = false;
    }
  }

  start (onRefresh) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onRefresh = onRefresh || null;
    this.refresh();
    this.timer = setInterval(() => this.refresh(), POLL_INTERVAL);
    logger.info('[Boss] 轮询启动 (3 分钟)');
  }

  stop () {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.onRefresh = null;
    logger.info('[Boss] 轮询停止');
  }

  getCache () {
    return this.cache;
  }
}

module.exports = new BossService();
