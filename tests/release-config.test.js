import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync('capacitor.config.ts', 'utf8');
const plist = readFileSync('ios/App/App/Info.plist', 'utf8');
const project = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8');

test('production starts bundled assets and has no remote server URL', () => {
  assert.doesNotMatch(config, /server\s*:\s*\{/);
  assert.doesNotMatch(config, /url\s*:\s*['"]https:\/\/www\.acutemedicaltake\.org/);
});

test('build 2 removes the armv7 installability gate', () => {
  assert.doesNotMatch(plist, /<string>armv7<\/string>/);
});

test('all review targets use the approved bundle namespace and version', () => {
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = uk\.acutemedicine\.acutemedicaltake;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = uk\.acutemedicine\.acutemedicaltake\.widgets;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = uk\.acutemedicine\.acutemedicaltake\.watch;/);
  assert.equal((project.match(/CURRENT_PROJECT_VERSION = 2;/g) || []).length, 6);
  assert.equal((project.match(/MARKETING_VERSION = 1\.0\.0;/g) || []).length, 6);
});

test('Face ID copy and App Group entitlements are declared', () => {
  assert.match(plist, /NSFaceIDUsageDescription/);
  assert.match(readFileSync('ios/App/App/App.entitlements', 'utf8'), /group\.uk\.acutemedicine\.acutemedicaltake/);
  assert.match(readFileSync('ios/App/AMTWidgets/AMTWidgets.entitlements', 'utf8'), /group\.uk\.acutemedicine\.acutemedicaltake/);
});
