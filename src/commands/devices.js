'use strict';

const chalk = require('chalk');
const adb = require('../utils/adb');

async function devicesCommand() {
  const [devices, avds] = await Promise.all([adb.listDevices(), adb.listAvds()]);

  console.log(chalk.bold('Connected devices/emulators:'));
  if (devices.length === 0) console.log('  (none running)');
  devices.forEach((d) => console.log(`  - ${d}`));

  console.log(chalk.bold('\nAvailable AVDs:'));
  if (avds.length === 0) {
    console.log("  (none found \u2014 create one in Android Studio's Device Manager)");
  }
  avds.forEach((a) => console.log(`  - ${a}`));
}

module.exports = devicesCommand;
