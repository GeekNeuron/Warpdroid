'use strict';

const path = require('path');
const chalk = require('chalk');
const adb = require('../utils/adb');
const { buildDebugApk } = require('../utils/gradle');
const { getApkInfo } = require('../utils/apkInfo');

async function ensureDevice(opts) {
  let devices = await adb.listDevices();
  if (devices.length > 0) return devices[0];

  if (!opts.avd) {
    throw new Error(
      'No running device or emulator found. Connect a device, or pass --avd <name> to boot one.'
    );
  }

  console.log(chalk.cyan(`Starting emulator "${opts.avd}" ...`));
  adb.startAvd(opts.avd);
  console.log(chalk.cyan('Waiting for it to finish booting (this can take a minute)...'));
  await adb.waitForBoot();

  devices = await adb.listDevices();
  if (devices.length === 0) throw new Error('Emulator booted but no device was detected by adb.');
  return devices[0];
}

async function runCommand(projectDir, opts) {
  const dir = path.resolve(projectDir || '.');

  console.log(chalk.cyan(`Building ${dir} ...`));
  const apk = await buildDebugApk(dir, { silent: !!opts.quiet });
  console.log(chalk.green(`\u2713 Built ${apk}`));

  const deviceId = await ensureDevice(opts);
  console.log(chalk.cyan(`Using device ${deviceId}`));

  console.log(chalk.cyan('Installing APK ...'));
  await adb.install(apk, { deviceId });

  console.log(chalk.cyan('Resolving package / launcher activity ...'));
  const { package: pkg, activity } = await getApkInfo(apk, dir);
  console.log(chalk.green(`\u2713 ${pkg}/${activity}`));

  console.log(chalk.cyan('Launching app ...'));
  await adb.startActivity(pkg, activity, { deviceId });

  if (opts.logs !== false) {
    await new Promise((r) => setTimeout(r, 1500));
    const pid = await adb.getPid(pkg, { deviceId });
    console.log(chalk.cyan(`Streaming logcat${pid ? ` (pid ${pid})` : ''} \u2014 Ctrl+C to stop\n`));
    await adb.streamLogcat(pkg, pid, { deviceId });
  }
}

module.exports = runCommand;
