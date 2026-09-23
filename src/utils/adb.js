'use strict';

const { run, spawnBackground } = require('./exec');

async function listDevices() {
  const { stdout } = await run('adb', ['devices'], { silent: true });
  return stdout
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('*'))
    .map((l) => l.split(/\s+/))
    .filter(([, state]) => state === 'device')
    .map(([id]) => id);
}

async function listAvds() {
  const { stdout } = await run('emulator', ['-list-avds'], {
    silent: true,
    allowFail: true,
  });
  return stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function startAvd(name) {
  return spawnBackground('emulator', ['-avd', name, '-netdelay', 'none', '-netspeed', 'full']);
}

async function waitForBoot(timeoutMs = 120000) {
  await run('adb', ['wait-for-device'], { silent: true });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { stdout } = await run('adb', ['shell', 'getprop', 'sys.boot_completed'], {
      silent: true,
      allowFail: true,
    });
    if (stdout.trim() === '1') return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Timed out waiting for the emulator to finish booting.');
}

async function install(apkPath, { deviceId } = {}) {
  const args = deviceId ? ['-s', deviceId, 'install', '-r', apkPath] : ['install', '-r', apkPath];
  await run('adb', args, { silent: false });
}

async function startActivity(pkg, activity, { deviceId } = {}) {
  const component = `${pkg}/${activity}`;
  const base = deviceId ? ['-s', deviceId] : [];
  await run('adb', [...base, 'shell', 'am', 'start', '-n', component], { silent: false });
}

async function getPid(pkg, { deviceId } = {}) {
  const base = deviceId ? ['-s', deviceId] : [];
  const { stdout } = await run('adb', [...base, 'shell', 'pidof', pkg], {
    silent: true,
    allowFail: true,
  });
  const pid = stdout.trim();
  return pid || null;
}

async function openUri(uri, { deviceId } = {}) {
  const base = deviceId ? ['-s', deviceId] : [];
  await run('adb', [...base, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', uri], {
    silent: false,
  });
}

function streamLogcat(pkg, pid, { deviceId } = {}) {
  const base = deviceId ? ['-s', deviceId] : [];
  const args = pid ? [...base, 'logcat', `--pid=${pid}`] : [...base, 'logcat'];
  return run('adb', args, { silent: false, allowFail: true });
}

module.exports = {
  listDevices,
  listAvds,
  startAvd,
  waitForBoot,
  install,
  startActivity,
  openUri,
  getPid,
  streamLogcat,
};
