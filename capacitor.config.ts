import type { CapacitorConfig } from '@capacitor/cli';

const isIosBuild = process.env.CAPACITOR_PLATFORM === 'ios';

const config: CapacitorConfig = {
  // Preserve the identifiers already established for each store platform.
  appId: isIosBuild
    ? 'uk.acutemedicine.acutemedicaltake'
    : 'org.acutemedicaltake.app',
  appName: 'Acute Medical Take',
  webDir: 'dist',
  server: {
    url: 'https://www.acutemedicaltake.org',
    cleartext: false,
    allowNavigation: ['acutemedicaltake.org', 'www.acutemedicaltake.org']
  },
  android: {
    allowMixedContent: false
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true
  }
};

export default config;
