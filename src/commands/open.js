'use strict';

const chalk = require('chalk');
const adb = require('../utils/adb');

async function openCommand(uri, opts) {
  const devices = await adb.listDevices();
  if (devices.length === 0) throw new Error('No running device or emulator found.');
  const deviceId = opts.device || devices[0];

  await adb.openUri(uri, { deviceId });
  console.log(chalk.green(`\u2713 Opened ${uri}`));
}

module.exports = openCommand;
