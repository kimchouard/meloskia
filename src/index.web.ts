import '@expo/metro-runtime';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

// This file should only import and register the root. No components or exports
// should be added here.
LoadSkiaWeb({
  locateFile: (file) => `/public/static/js/${file}`,
}).then(async () => {
  renderRootComponent(App);
});
