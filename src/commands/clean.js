'use strict';

const path = require('path');
const chalk = require('chalk');
const { run } = require('../utils/exec');
const { wrapperPath } = require('../utils/gradle');

async function cleanCommand(projectDir) {
  const dir = path.resolve(projectDir || '.');
  const wrapper = wrapperPath(dir);
  if (!wrapper) {
    throw new Error(`No Gradle wrapper found in ${dir}.`);
  }
  await run(wrapper, ['clean'], { cwd: dir });
  console.log(chalk.green('\u2713 Cleaned'));
}

module.exports = cleanCommand;
