import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'E-Commerce App',
  slug: 'ecommerce-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    backgroundColor: '#0F0F0F',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.ecommerce',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0F0F0F',
    },
    package: 'com.yourcompany.ecommerce',
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        photosPermission: 'La app necesita acceso a tus fotos para subir imágenes de productos.',
        cameraPermission: 'La app necesita acceso a tu cámara para tomar fotos de productos.',
      },
    ],
  ],
  scheme: 'ecommerce',
  experiments: {
    typedRoutes: true,
  },
});