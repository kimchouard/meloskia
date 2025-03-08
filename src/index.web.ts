// This file should only import and register the root. No components or exports
// should be added here.

import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

// RN Skia (WASM)
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// RN Audio API (WASM for Stretcher Node => respecting pitch when changing BPM / playing rate ;)
import { LoadCustomWasm } from 'react-native-audio-api';


// Load the WASM file for react-native-skia
LoadSkiaWeb({ locateFile: (file) => `/${file}` }).then(() => {
  // Load the custom WASM file for react-native-audio-api
  LoadCustomWasm().then(() => {
    renderRootComponent(App);
  });
});

// RN Skia (CanvasKitJS)
// import { CanvasKitJS } from 'canvaskit-js';
// (async () => {
//   global.CanvasKit = CanvasKitJS.getInstance();
//   renderRootComponent(App);
// })();
