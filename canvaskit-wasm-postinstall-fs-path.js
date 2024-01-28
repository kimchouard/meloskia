// To be added in package.json "postinstall": "(...) && node [name-of-this-file].js"
const fs = require('fs');
const path = require('path');

const packageJsonDirectPath = path.join(__dirname, 'node_modules', /* '@shopify', 'react-native-skia', 'node_modules', */ 'canvaskit-wasm', 'package.json');
// eslint-disable-next-line import/no-dynamic-require
const packageJsonDirect = require(packageJsonDirectPath);
packageJsonDirect.browser = {
  fs: false,
  path: false,
  os: false,
};

fs.writeFileSync(packageJsonDirectPath, JSON.stringify(packageJsonDirect, null, 2));