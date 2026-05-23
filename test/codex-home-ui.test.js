const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const homeHtml = fs.readFileSync(path.join(root, 'src/renderer/home.html'), 'utf8');
const homeCss = fs.readFileSync(path.join(root, 'src/renderer/home-style.css'), 'utf8');
const homeJs = fs.readFileSync(path.join(root, 'src/renderer/home.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const codexUsageJs = fs.readFileSync(path.join(root, 'src/main/codex-usage.js'), 'utf8');

assert.match(homeHtml, /class="codex-usage-card"/);
assert.match(homeHtml, /id="codex-primary-bar"/);
assert.match(homeHtml, /id="codex-secondary-bar"/);
assert.match(homeHtml, /Codex 额度/);

assert.match(homeCss, /\.codex-usage-card/);
assert.match(homeCss, /\.codex-meter-fill/);

assert.match(homeJs, /codex-usage-update/);
assert.match(homeJs, /get-codex-usage/);
assert.match(homeJs, /updateCodexUsage/);

assert.match(mainJs, /fetchUsageData/);
assert.match(mainJs, /ipcMain\.handle\('get-codex-usage'/);
assert.match(mainJs, /startUsagePolling\(\(\) => \[mainWindow, homeWindow\]\)/);
assert.match(codexUsageJs, /codex-usage-update/);

console.log('codex-home-ui tests passed');
