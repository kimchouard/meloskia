// This file should only import and register the root. No components or exports
// should be added here.

import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

// RN Skia (WASM)
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

LoadSkiaWeb({
  locateFile: (file) => `/static/js/${file}`,
}).then(async () => {
  renderRootComponent(App);
});

// RN Skia (CanvasKitJS)
// import { CanvasKitJS } from 'canvaskit-js';
// (async () => {
//   global.CanvasKit = CanvasKitJS.getInstance();
//   renderRootComponent(App);
// })();
