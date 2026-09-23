'use strict';

const chalk = require('chalk');
const adb = require('../utils/adb');

async function logsCommand(pkgName, opts) {
  const devices = await adb.listDevices();
  if (devices.length === 0) throw new Error('No running device or emulator found.');
  const deviceId = opts.device || devices[0];

  const pid = await adb.getPid(pkgName, { deviceId });
  if (!pid) {
    console.log(chalk.yellow(`"${pkgName}" doesn't seem to be running \u2014 showing unfiltered logcat.`));
  } else {
    console.log(chalk.cyan(`Streaming logcat for ${pkgName} (pid ${pid}) \u2014 Ctrl+C to stop\n`));
  }
  await adb.streamLogcat(pkgName, pid, { deviceId });
}

module.exports = logsCommand;
