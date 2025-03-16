import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

// RN Skia (WASM)
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// RN Audio API (WASM for Stretcher Node => respecting pitch when changing BPM / playing rate ;)
import { LoadCustomWasm } from 'react-native-audio-api';

LoadCustomWasm();

// Load the WASM file for react-native-skia
LoadSkiaWeb({ locateFile: (file) => `/${file}` }).then(() => {
  renderRootComponent(App);
});
