import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appGradle = readFileSync('android/app/build.gradle', 'utf8');
const manifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const billingPlugin = readFileSync(
  'android/app/src/main/java/org/acutemedicaltake/app/AMTBillingPlugin.java',
  'utf8'
);
const nativePlugin = readFileSync(
  'android/app/src/main/java/org/acutemedicaltake/app/AMTNativeFeaturesPlugin.java',
  'utf8'
);
const main = readFileSync('src/main.js', 'utf8');

test('Android 1.2.0 uses the established package and current target SDK', () => {
  assert.match(appGradle, /applicationId 'org\.acutemedicaltake\.app'/);
  assert.match(appGradle, /versionCode 2/);
  assert.match(appGradle, /versionName '1\.2\.0'/);
  assert.match(readFileSync('android/variables.gradle', 'utf8'), /targetSdkVersion\s*=\s*36/);
});

test('production Android content is bundled and cleartext traffic is disabled', () => {
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:scheme="https"/);
  assert.doesNotMatch(readFileSync('capacitor.config.ts', 'utf8'), /server\s*:\s*\{/);
});

test('AMT Pro is a single non-consumable Google Play product', () => {
  assert.match(appGradle, /com\.android\.billingclient:billing:9\.1\.0/);
  assert.match(billingPlugin, /PRODUCT_ID = "amt_pro_lifetime"/);
  assert.match(billingPlugin, /BillingClient\.ProductType\.INAPP/);
  assert.match(billingPlugin, /acknowledgePurchase/);
  assert.doesNotMatch(billingPlugin, /consumeAsync/);
  assert.match(main, /ONE PAYMENT · LIFETIME ACCESS/);
  assert.match(main, /No subscription\./);
});

test('Android personal notes use authenticated Keystore encryption', () => {
  assert.match(nativePlugin, /AndroidKeyStore/);
  assert.match(nativePlugin, /AES\/GCM\/NoPadding/);
  assert.match(nativePlugin, /setUserAuthenticationRequired\(true\)/);
  assert.match(nativePlugin, /BIOMETRIC_STRONG/);
});

test('release signing is supplied only through environment variables', () => {
  assert.match(appGradle, /ANDROID_KEYSTORE_PATH/);
  assert.match(appGradle, /ANDROID_KEYSTORE_PASSWORD/);
  assert.doesNotMatch(appGradle, /storePassword\s+['"][^'"]+['"]/);
  assert.doesNotMatch(appGradle, /keyPassword\s+['"][^'"]+['"]/);
});
