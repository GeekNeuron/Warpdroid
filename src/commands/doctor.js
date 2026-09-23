'use strict';

const path = require('path');
const chalk = require('chalk');
const { run } = require('../utils/exec');
const { wrapperPath } = require('../utils/gradle');

async function checkBinary(cmd, args) {
  try {
    await run(cmd, args, { silent: true, allowFail: true });
    return true;
  } catch {
    return false;
  }
}

async function doctorCommand(projectDir) {
  const dir = path.resolve(projectDir || '.');
  const results = [];

  results.push(['ANDROID_HOME / ANDROID_SDK_ROOT set', !!(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT)]);
  results.push(['java found', await checkBinary('java', ['-version'])]);
  results.push(['adb found', await checkBinary('adb', ['version'])]);
  results.push(['emulator found', await checkBinary('emulator', ['-version'])]);
  results.push(['aapt or aapt2 found', (await checkBinary('aapt2', ['version'])) || (await checkBinary('aapt', ['version']))]);
  results.push(['Gradle wrapper present in project', !!wrapperPath(dir)]);

  let devices = [];
  try {
    const { stdout } = await run('adb', ['devices'], { silent: true, allowFail: true });
    devices = stdout
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .filter((l) => l.endsWith('\tdevice'));
  } catch {}
  results.push(['at least one device/emulator connected', devices.length > 0]);

  for (const [label, ok] of results) {
    const icon = ok ? chalk.green('\u2713') : chalk.red('\u2717');
    console.log(`${icon}  ${label}`);
  }

  const failed = results.filter(([, ok]) => !ok);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

module.exports = doctorCommand;
