'use strict';

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const pkgBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'pkg.cmd' : 'pkg');

execFileSync(pkgBin, ['.', '--target', 'node22-win-x64', '--output', path.join(distDir, 'warpdroid.exe')], {
  cwd: root,
  stdio: 'inherit',
});

console.log(`Built: ${path.join(distDir, 'warpdroid.exe')}`);
