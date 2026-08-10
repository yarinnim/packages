import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import base, { getFiles, getPlugins } from '../../bin/config/eslint.config.mjs';

const [config] = base;

const newConfig = {
  ...config,
  files: getFiles(['**/*.tsx']),
  plugins: getPlugins({ react, 'react-hooks': reactHooks }),
};

export default [newConfig];
