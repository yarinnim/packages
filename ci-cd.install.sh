#!/bin/bash

rm -rfv babel.config.js eslint.config.js jest.config.ts nodemon.json
ln -s ../bin/config/babel.config.js .
ln -s ../bin/config/eslint.config.js .
ln -s ../bin/config/jest.config.ts .
ln -s ../bin/config/nodemon.json .

npm install
npm install dotenv
npm install --save-dev @babel/core @babel/preset-env @babel/preset-typescript \
  @types/jest @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  babel-jest eslint eslint-plugin-import eslint-plugin-tsdoc globals jest \
  nodemon ts-node typescript typescript-eslint
