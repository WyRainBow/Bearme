const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const filesToCheck = [
  'src/main.js',
  'src/renderer/index.html',
  'src/renderer/renderer.js',
  'src/renderer/home.html',
  'src/renderer/home.js',
  'src/renderer/style.css',
  'src/renderer/home-style.css'
];

const forbiddenPatterns = [
  /sign-in/,
  /每日签到/,
  /签到/,
  /level-badge/,
  /pet-level/,
  /exp-bar/,
  /exp-value/,
  /exp-gain/,
  /task-completed/,
  /addExp/,
  /checkForLevelUp/,
  /handleSignIn/
];

for (const relativePath of filesToCheck) {
  const content = fs.readFileSync(path.join(root, relativePath), 'utf8');

  for (const pattern of forbiddenPatterns) {
    assert.ok(!pattern.test(content), `${relativePath} still contains ${pattern}`);
  }
}

console.log('no-gamification tests passed');
