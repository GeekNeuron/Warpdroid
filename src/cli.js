#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

const buildCommand = require('./commands/build');
const runCommand = require('./commands/run');
const devicesCommand = require('./commands/devices');
const logsCommand = require('./commands/logs');
const doctorCommand = require('./commands/doctor');
const cleanCommand = require('./commands/clean');
const openCommand = require('./commands/open');

const program = new Command();

program
  .name('warpdroid')
  .description(
    'Build, install and launch open-source Android projects on your local emulator \u2014 no manual APK wrangling.'
  )
  .version(pkg.version);

program
  .command('build [project]')
  .description('Build a debug APK for the project (default: current directory)')
  .option('-q, --quiet', 'suppress Gradle output')
  .action(async (project, opts) => {
    try {
      await buildCommand(project, opts);
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program
  .command('run [project]')
  .description('Build, install and launch the project in one step, then stream its logs')
  .option('-a, --avd <name>', 'boot this AVD if no device is already running')
  .option('-q, --quiet', 'suppress Gradle output')
  .option('--no-logs', 'skip streaming logcat after launch')
  .action(async (project, opts) => {
    try {
      await runCommand(project, opts);
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program
  .command('devices')
  .description('List connected devices/emulators and available AVDs')
  .action(async () => {
    try {
      await devicesCommand();
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program
  .command('logs <package>')
  .description('Stream logcat for a running app, filtered to its process')
  .option('-d, --device <id>', 'target a specific device id')
  .action(async (pkgName, opts) => {
    try {
      await logsCommand(pkgName, opts);
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program
  .command('doctor [project]')
  .description('Check that Java, the Android SDK tools, and the Gradle wrapper are all in place')
  .action(async (project) => {
    try {
      await doctorCommand(project);
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program
  .command('clean [project]')
  .description('Run gradlew clean on the project')
  .action(async (project) => {
    try {
      await cleanCommand(project);
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program
  .command('open <uri>')
  .description('Open a URL or deep link on the connected device/emulator')
  .option('-d, --device <id>', 'target a specific device id')
  .action(async (uri, opts) => {
    try {
      await openCommand(uri, opts);
    } catch (err) {
      console.error(chalk.red(`\u2717 ${err.message}`));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
