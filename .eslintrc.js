const path = require('path');

module.exports = {
  root: true,
  extends: [
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    // '@react-native-community',
    "plugin:react-hooks/recommended",
    // "plugin:react-native/recommended",
  ],
  plugins: ['react', 'react-native', '@typescript-eslint', 'import'],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    }
  },
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigRootDir: __dirname
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // Manual rules
    "react-native/no-raw-text": ["error", { "skip": ["title", "Button", "Link"] }],

    // Disabling
    "max-len": "off",
    "consistent-return": "off",
    
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-var-requires": "off",
    "global-require": "off",
    "no-param-reassign": "off",
    "no-console": "off",
    "import/extensions": "off",
    "no-restricted-imports": "off",
    "@typescript-eslint/no-restricted-imports": [
      "warn",
      {
        "name": "react-redux",
        "importNames": ["useSelector", "useDispatch"],
        "message": "Use typed hooks `useAppDispatch` and `useAppSelector` instead."
      }
    ],
  }
};