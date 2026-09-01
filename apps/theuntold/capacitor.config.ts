import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tellcore.theuntold',
  appName: 'TheUntold',
  webDir: 'dist',
  backgroundColor: '#fdfaf6',
  ios: {
    contentInset: 'never',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
