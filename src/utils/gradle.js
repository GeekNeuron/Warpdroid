'use strict';

const fs = require('fs');
const path = require('path');
const { run } = require('./exec');
const { findFiles } = require('./fsWalk');

function wrapperPath(projectDir) {
  const isWin = process.platform === 'win32';
  const wrapper = path.join(projectDir, isWin ? 'gradlew.bat' : 'gradlew');
  return fs.existsSync(wrapper) ? wrapper : null;
}

async function buildDebugApk(projectDir, { task = 'assembleDebug', silent = false } = {}) {
  const wrapper = wrapperPath(projectDir);
  if (!wrapper) {
    throw new Error(
      `No Gradle wrapper found in ${projectDir}. Expected gradlew${
        process.platform === 'win32' ? '.bat' : ''
      }.`
    );
  }

  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(wrapper, 0o755);
    } catch {}
  }

  await run(wrapper, [task], { cwd: projectDir, silent });

  const apkGlob = path.join('outputs', 'apk') + path.sep;
  const apks = findFiles(projectDir, (f) => f.endsWith('.apk') && f.includes(apkGlob));

  if (apks.length === 0) {
    throw new Error('Build finished but no APK was found under build/outputs/apk/.');
  }

  apks.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return apks[0];
}

module.exports = { buildDebugApk, wrapperPath };
