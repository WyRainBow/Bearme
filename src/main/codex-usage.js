const { net } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const AUTH_PATH = path.join(CODEX_HOME, 'auth.json');
const DB_PATH = fs.existsSync(path.join(CODEX_HOME, 'logs_2.sqlite'))
  ? path.join(CODEX_HOME, 'logs_2.sqlite')
  : path.join(CODEX_HOME, 'logs_1.sqlite');
const USAGE_URL = 'https://chatgpt.com/backend-api/wham/usage';
const POLL_INTERVAL = 20_000;

let pollTimer = null;

function readAuthToken() {
  try {
    const raw = fs.readFileSync(AUTH_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (data.OPENAI_API_KEY) return data.OPENAI_API_KEY;
    return data.tokens?.access_token || null;
  } catch {
    return null;
  }
}

function fetchUsageData() {
  const token = readAuthToken();
  if (!token) return readSqliteFallback();

  return new Promise((resolve) => {
    const request = net.request(USAGE_URL);
    request.setHeader('Authorization', `Bearer ${token}`);
    request.setHeader('Accept', 'application/json');

    const timeout = setTimeout(() => {
      request.abort();
      resolve(readSqliteFallback());
    }, 6000);

    let body = '';
    request.on('response', (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        clearTimeout(timeout);
        resolve(readSqliteFallback());
        return;
      }
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        clearTimeout(timeout);
        try {
          const parsed = JSON.parse(body);
          resolve(normalizeFromApi(parsed));
        } catch {
          resolve(readSqliteFallback());
        }
      });
    });
    request.on('error', () => {
      clearTimeout(timeout);
      resolve(readSqliteFallback());
    });
    request.end();
  });
}

function normalizeFromApi(payload) {
  const rl = payload.rate_limit || {};
  const primary = rl.primary || rl.primary_window;
  const secondary = rl.secondary || rl.secondary_window;
  return {
    planType: payload.plan_type || null,
    source: 'live',
    timestamp: Date.now(),
    primary: primary ? normalizeBucket(primary) : null,
    secondary: secondary ? normalizeBucket(secondary) : null
  };
}

function normalizeBucket(b) {
  const used = b.used_percent ?? 0;
  const minutes = b.window_minutes ?? (b.limit_window_seconds ? b.limit_window_seconds / 60 : null);
  return {
    usedPercent: used,
    remainingPercent: Math.max(100 - used, 0),
    windowMinutes: minutes,
    resetAt: b.reset_at || null,
    countdownSeconds: b.reset_at ? Math.max(b.reset_at - Math.floor(Date.now() / 1000), 0) : null
  };
}

function readSqliteFallback() {
  if (!fs.existsSync(DB_PATH)) return null;

  return new Promise((resolve) => {
    const sql = `SELECT feedback_log_body FROM logs WHERE feedback_log_body LIKE '%codex.rate_limits%' ORDER BY rowid DESC LIMIT 1;`;
    execFile('/usr/bin/sqlite3', [DB_PATH, sql], { timeout: 5000 }, (err, stdout) => {
      if (err || !stdout) { resolve(null); return; }
      try {
        const json = extractJsonFromLog(stdout);
        if (!json) { resolve(null); return; }
        resolve(normalizeFromLog(json));
      } catch {
        resolve(null);
      }
    });
  });
}

function extractJsonFromLog(text) {
  const start = text.indexOf('{"type":"codex.rate_limits"');
  if (start === -1) return null;

  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  return null;
}

function normalizeFromLog(data) {
  const rl = data.rate_limits || {};
  return {
    planType: data.plan_type || null,
    source: 'log',
    timestamp: Date.now(),
    primary: rl.primary ? normalizeBucket(rl.primary) : null,
    secondary: rl.secondary ? normalizeBucket(rl.secondary) : null
  };
}

function formatCountdown(seconds) {
  if (seconds == null) return '';
  if (seconds <= 0) return '0m';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function resolveTargets(targets) {
  const resolved = typeof targets === 'function' ? targets() : targets;
  return Array.isArray(resolved) ? resolved : [resolved];
}

function sendUsageUpdate(targets, data) {
  for (const target of resolveTargets(targets)) {
    if (target && !target.isDestroyed() && target.webContents) {
      target.webContents.send('codex-usage-update', data);
    }
  }
}

async function poll(targets) {
  const data = await fetchUsageData();
  if (data) {
    sendUsageUpdate(targets, data);
  }
}

function startUsagePolling(targets) {
  poll(targets);
  pollTimer = setInterval(() => poll(targets), POLL_INTERVAL);
}

function stopUsagePolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

module.exports = {
  startUsagePolling,
  stopUsagePolling,
  fetchUsageData,
  normalizeFromApi,
  normalizeFromLog,
  normalizeBucket,
  extractJsonFromLog,
  formatCountdown,
  readAuthToken,
  sendUsageUpdate
};
