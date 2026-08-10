const baseConfig = require('../../bin/config/babel.config.js');

const { presets } = baseConfig;
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  ...baseConfig,
  presets: [
    ...presets,
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: isDevelopment,
      },
    ],
  ],
};
