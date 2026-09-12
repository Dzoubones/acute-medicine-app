import type { CapacitorConfig } from '@capacitor/cli';

const isIosBuild = process.env.CAPACITOR_PLATFORM === 'ios';

const config: CapacitorConfig = {
  // Preserve the identifiers already established for each store platform.
  appId: isIosBuild
    ? 'uk.acutemedicine.acutemedicaltake'
    : 'org.acutemedicaltake.app',
  appName: 'Acute Medical Take',
  webDir: 'dist',
  // Production deliberately loads the bundled Vite output. The complete live
  // website is opened only through @capacitor/browser from clearly labelled UI.
  android: {
    allowMixedContent: false
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'recommended',
    scrollEnabled: true
  }
};

export default config;
