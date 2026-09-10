const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

const defaultRule = {
  sourceCode: {
    extension: 'ts|tsx',
    use: ['babel-loader'],
    exclude: /node_modules/,
  },

  asset: {
    extension: 'jpe?g|gif|png|svg',
    type: 'asset/resource',
    exclude: /node_modules/,
    generator: { filename: 'images/[name]-[hash][ext][query]' },
  },

  style: {
    extension: 'css',
    use: ['style-loader', 'css-loader'],
    generator: { filename: 'styles/[name]-[hash][ext][query]' },
  },
};

const getRule = (pRule, defaultRule) => {
  const mergedRule = { ...defaultRule, ...pRule };
  const { extension, ...restProps } = mergedRule;

  const rule = {
    ...restProps,
    test: new RegExp(`\\.(${extension})$`),
  };
  return rule;
};

const getRules = (props = {}) => {
  const { sourceCode = {}, asset = {}, style = {} } = props;
  return [
    getRule(sourceCode, defaultRule.sourceCode),
    getRule(asset, defaultRule.asset),
    getRule(style, defaultRule.style),
  ];
};


const getEnv = () => {
  const env = { 'process.env': JSON.stringify(process.env, null, 2) };
  return new webpack.DefinePlugin(env);
};

const getManifestPattern = () => ({
  from: './manifest.json',
  transform(content) {
    const manifest = JSON.parse(content.toString());
    const siteName = process.env.SITE_NAME || 'VibeTide';
    manifest.name = siteName;
    manifest.short_name = process.env.SITE_SHORT_NAME || siteName;
    manifest.description = (
      process.env.SITE_DESCRIPTION || `${siteName} streaming service`
    );
    return JSON.stringify(manifest, null, 2);
  },
});

const getSiteIconPath = () => {
  const iconPath = process.env.SITE_ICON_URL || '/icon.png';
  if (iconPath.startsWith('http')) return iconPath;
  if (iconPath.startsWith('/')) return `assets${iconPath}`;
  return iconPath;
};

const devConfig = (mode) => {
  if (mode === 'production') {
    return { optimization: { minimize: true } };
  }
  const toPath = path.resolve('./public');

  return {
    devtool: 'inline-source-map',
    devServer: {
      static: {
        directory: toPath,
        publicPath: '/',
      },
      port: process.env.APP_PORT || 8888,
      hot: true,
      historyApiFallback: true,
      allowedHosts: 'all',
    },
  };
};

const getPublicPath = () => {
  const outpath = process.env.APP_PATH || false;
  if (!outpath) return '/';
  const res = `${outpath}/`.replace(/\/\/$/g, '/');
  return res;
};

const getOutput = () => {
  const toPath = path.resolve('./public');

  return {
    path: toPath,
    filename: `js/[name]-[chunkhash].bundle.js`,
    assetModuleFilename: 'assets/[name].[hash][ext][query]',
    publicPath: getPublicPath(),
  };
};

module.exports = (env, { mode }, callback = {}) => {
  process.env.NODE_ENV = mode || process.env.NODE_ENV || 'development';

  const {
    rules: cbRules = {},
    copyPatterns = [],
    devServer = false,
    htmlPlugin: htmlPluginOverride = {},
  } = callback;
  const rules = getRules(cbRules);
  const srcPath = path.resolve('./src');
  const devConf = devConfig(mode);
  const touchedDev = devServer ?  devServer(devConf) : devConf;

  return {
    mode,
    entry: './src/Main.tsx',
    output: getOutput(),
    module: { rules },
    resolve: {
      extensions: ['.ts', '.tsx', '.js','.json'],
      alias: { '@': srcPath },
    },
    target: ['web', 'es6'],
    plugins: [
      getEnv(),
      new CopyWebpackPlugin({
        patterns: [
          getManifestPattern(),
          { from: './assets', to: 'assets' },
          ...copyPatterns,
        ],
      }),
      new HtmlWebpackPlugin({
        title: process.env.APP_TITLE || process.env.SITE_NAME || 'VibeTide',
        siteIcon: getSiteIconPath(),
        ...htmlPluginOverride,
        template: './index.html',
        filename: './index.html',
        baseHref: getPublicPath(),
        base: getPublicPath(),
      }),
    ],
    ...touchedDev,
  };
};
