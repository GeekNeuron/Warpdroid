'use strict';

const path = require('path');
const chalk = require('chalk');
const { buildDebugApk } = require('../utils/gradle');

async function buildCommand(projectDir, opts) {
  const dir = path.resolve(projectDir || '.');
  console.log(chalk.cyan(`Building ${dir} ...`));
  const apk = await buildDebugApk(dir, { silent: !!opts.quiet });
  console.log(chalk.green(`\u2713 Built ${apk}`));
  return apk;
}

module.exports = buildCommand;
