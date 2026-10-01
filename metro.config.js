const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Prefer the built JS entry. Metro's `react-native` field points at
    // `src/index.ts`, which can fail to resolve fabric native-component
    // siblings after a mid-session install / stale haste map on Windows.
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native-svg') {
        return {
          type: 'sourceFile',
          filePath: path.resolve(
            __dirname,
            'node_modules/react-native-svg/lib/commonjs/index.js',
          ),
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
