const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const homeHtml = fs.readFileSync(path.join(root, 'src/renderer/home.html'), 'utf8');
const modernHtml = fs.readFileSync(path.join(root, 'src/renderer/modern-settings.html'), 'utf8');
const modernCss = fs.readFileSync(path.join(root, 'src/renderer/modern-style.css'), 'utf8');
const homeJs = fs.readFileSync(path.join(root, 'src/renderer/home.js'), 'utf8');
const modernJs = fs.readFileSync(path.join(root, 'src/renderer/modern-settings.js'), 'utf8');

assert.match(homeHtml, /id="avatar-image"/);
assert.match(homeHtml, /id="avatar-upload-btn"/);
assert.match(modernHtml, /id="avatar-image"/);
assert.match(modernHtml, /id="avatar-upload-btn"/);
assert.match(modernCss, /\.avatar-container\s*{[\s\S]*border-radius:\s*50%/);
assert.match(modernCss, /\.sidebar\s*{[\s\S]*padding:\s*36px 0 20px/);
assert.match(homeJs, /select-custom-avatar/);
assert.match(modernJs, /select-custom-avatar/);

console.log('avatar-ui tests passed');
