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
    // Android WebViews report env(safe-area-inset-*) as 0; let Capacitor pad
    // the WebView below the status bar / above the nav bar instead.
    adjustMarginsForEdgeToEdge: 'force',
  },
};

export default config;
