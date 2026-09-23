'use strict';

const { spawn } = require('child_process');

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: opts.silent ? 'pipe' : 'inherit',
      shell: process.platform === 'win32',
      cwd: opts.cwd || process.cwd(),
      env: opts.env || process.env,
    });

    let stdout = '';
    let stderr = '';

    if (opts.silent) {
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0 && !opts.allowFail) {
        const err = new Error(`Command failed (${code}): ${cmd} ${args.join(' ')}\n${stderr}`);
        err.code = code;
        err.stdout = stdout;
        err.stderr = stderr;
        return reject(err);
      }
      resolve({ code, stdout, stderr });
    });
  });
}

function spawnBackground(cmd, args = [], opts = {}) {
  const child = spawn(cmd, args, {
    stdio: 'ignore',
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
    cwd: opts.cwd || process.cwd(),
    env: opts.env || process.env,
  });
  child.unref();
  return child;
}

module.exports = { run, spawnBackground };
