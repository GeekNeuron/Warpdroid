'use strict';

const fs = require('fs');
const path = require('path');
const { run } = require('./exec');
const { XMLParser } = require('fast-xml-parser');

async function viaAapt(apkPath, binary) {
  const { stdout } = await run(binary, ['dump', 'badging', apkPath], {
    silent: true,
    allowFail: true,
  });
  const pkgMatch = stdout.match(/package: name='([^']+)'/);
  const actMatch = stdout.match(/launchable-activity: name='([^']+)'/);
  if (pkgMatch && actMatch) {
    return { package: pkgMatch[1], activity: actMatch[1] };
  }
  return null;
}

function findNamespace(moduleDir) {
  for (const file of ['build.gradle.kts', 'build.gradle']) {
    const p = path.join(moduleDir, file);
    if (!fs.existsSync(p)) continue;
    const match = fs.readFileSync(p, 'utf8').match(/namespace\s*[=(]?\s*["']([^"']+)["']/);
    if (match) return match[1];
  }
  return null;
}

function viaManifest(projectDir) {
  const moduleDir = path.join(projectDir, 'app');
  const manifestPath = path.join(moduleDir, 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) return null;

  const xml = fs.readFileSync(manifestPath, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const doc = parser.parse(xml);
  const manifest = doc.manifest;
  if (!manifest) return null;

  const pkg = manifest['@_package'] || findNamespace(moduleDir);
  const application = manifest.application;
  if (!pkg || !application) return null;

  let activities = application.activity;
  if (!activities) return null;
  if (!Array.isArray(activities)) activities = [activities];

  const launcher = activities.find((a) => {
    const filters = a['intent-filter'];
    if (!filters) return false;
    const list = Array.isArray(filters) ? filters : [filters];
    return list.some((f) => {
      const actions = [].concat(f.action || []);
      const categories = [].concat(f.category || []);
      const hasMain = actions.some((x) => x['@_android:name'] === 'android.intent.action.MAIN');
      const hasLauncher = categories.some(
        (x) => x['@_android:name'] === 'android.intent.category.LAUNCHER'
      );
      return hasMain && hasLauncher;
    });
  });

  if (!launcher) return null;
  let activityName = launcher['@_android:name'];
  if (activityName.startsWith('.')) activityName = pkg + activityName;
  return { package: pkg, activity: activityName };
}

async function getApkInfo(apkPath, projectDir) {
  for (const binary of ['aapt2', 'aapt']) {
    try {
      const result = await viaAapt(apkPath, binary);
      if (result) return result;
    } catch {}
  }

  const manifestResult = viaManifest(projectDir);
  if (manifestResult) return manifestResult;

  throw new Error(
    'Could not determine the package name / launcher activity. Install Android build-tools (for aapt) or check your AndroidManifest.xml.'
  );
}

module.exports = { getApkInfo, viaManifest };
