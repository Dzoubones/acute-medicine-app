import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.acutemedicaltake.app',
  appName: 'Acute Medical Take',
  webDir: 'dist',
  server: {
    url: 'https://www.acutemedicaltake.org',
    cleartext: false,
    allowNavigation: ['acutemedicaltake.org', 'www.acutemedicaltake.org']
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
