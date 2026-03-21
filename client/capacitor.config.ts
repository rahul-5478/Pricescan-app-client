import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pricescan.app',
  appName: 'PriceScan',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // set false in production
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,       // We handle splash in React, so set 0
      launchAutoHide: true,
      backgroundColor: "#07080F", // Dark background matches our splash
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",              // Light icons on dark background
      backgroundColor: "#07080F",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#07080F",
    buildOptions: {
      releaseType: "APK",
    },
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#07080F",
  },
};

export default config;