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
    // Insets are handled by @capawesome/capacitor-android-edge-to-edge-support
    // (Capacitor's own margin adjustment proved unreliable on real devices);
    // keep the built-in one off so the two never double-pad.
    adjustMarginsForEdgeToEdge: 'disable',
  },
};

export default config;
