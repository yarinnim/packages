# Web Config

Web configure is pre-register the node packages required by the
web application. It's used for remove the common works of installing
the packages again and again for web application. The default configure
is shipped with:

Production (``dependencies``):
  - ReactJS (``react``)
  - React DOM (``react-dom``)
  - React Router (``react-router-dom``)

Development (``devDependencies``):
  - Jest Dom (``jest-dom``)
  - React Testing Library (``@testing-library/react``)
  - Testing Library User Event (``@testing-library/user-event``)
  - TailwindCSS (``tailwindcss``)
  - Webpack (``webpack``)

## Add to Web App

To add the default required packages (for development and production)
we need to add to the ``package.json`` development dependencies as the following:

```json
  "devDependencies": {
    "@core/web-config": "^1.0.0"
  }
```
## Initialize

We can intialize the Web Application with very simple steps as the following:

### Initialize Code-Base

Create a folder of your project, name it refers to your application, and strongly
recomment to be suffixed by ``-web`` under the ``apps`` folder of your monorepos
project. Example, your new web project is named ``test``, so it might be:

```bash
$> mkdir -p apps/test-web
$> cd apps/test-web
npm init --scope=test
```

### Initialize Package

Add the ``@core/web-config`` package in to your ``package.json``'s development
dependencies as the following:

```json
"devDependencies": {
  "@core/web-config": "^1.0.0"
}
```

And then create the ``tsconfig.json`` file to define the in-house (local) package
as the following:

```json
{
  "extends": "../../bin/config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "build"
  },
  "exclude": ["./build", "./public"],
  "include": ["./src/**/*"],
  "references": [
    {"path": "../../packages/web-config"}
  ]
}
```

### Initialize Monorepos App

After the local package is added, you need to run the application initialization
again as mention in the following code snippet.

```bash
$> cd ../ # Back to the root folder
$> ./bin/init apps/test-web # Initialize the Monorepose base application
$> cd apps/test-web  # Back to the application folder
$> npx core-web init # Initialize the web application
```

After the web application is initialized using the ``@core/web-config``, you will
get the all the code-base and the ``package.json`` and ``tsconfig.json`` are overwritten
with extra depedencies as the following:

``package.json``
```json
{
  "name": "@test/test-web",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest --detectOpenHandles --forceExit",
    "pre-build": "tsc --build -f ./tsconfig.json",
    "build": "rm -rfv public && webpack --mode production && ls -lhrt public/js",
    "start:dev": "npm run pre-build && webpack-dev-server --mode development",
    "analyze-bundle": "webpack --mode production --config ../../webpack.analyze.js --analyze",
    "test:dev": "npm run test -- --watchAll",
    "jsdoc": "tsc && jsdoc build/**/* -d jsdoc",
    "eslint": "eslint src --ext .ts,.tsx"
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "@core/web-config": "^1.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/react-router-dom": "^5.3.3"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  }
}
```

``tsconfig.json``
```json
{
  "extends": "../../bin/config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "build",
    "jsx": "react-jsx",
    "paths": {"@/*": ["./src/*"]}
  },
  "exclude": ["./build", "./public"],
  "include": ["./src/**/*"],
  "references": [
    {"path": "../../packages/web-config"}
  ]
}
```

And the project is full initialized


```bash
├── babel.config.js
├── docker-compose.yml
├── Dockerfile
├── env.example
├── jest.config.ts -> ../../bin/config/jest.config.ts
├── nginx.conf
├── nginx-proxy.conf
├── package.json
├── postcss.config.js
├── src
│   ├── constant.ts
│   ├── Context.tsx
│   ├── images
│   │   ├── logo-192x192.png
│   │   ├── logo-512x512.png
│   │   └── logo-72x72.png
│   ├── index.html
│   ├── Main.tsx
│   ├── manifest.json
│   ├── pages
│   │   └── Home.tsx
│   ├── routes
│   │   └── index.ts
│   ├── styles
│   │   └── main.css
│   └── workers
│       ├── common.ts
│       └── index.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── webpack-base.config.js
└── webpack.config.js
```

### Start development

To start development, just run 
```bash
$> npm run start:dev
```

### Build the web

To build and package the project, use:

```bash
$> npm run build
```

### To analyze the bundle

```bash
$> npm run analyze-bundle
```
