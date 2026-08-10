# Log Client

Log client uses message queue connection to initialize the
event-driven mechanism to broadcast the event to the logger
service.

## Install

Add the package into the ``package.json``

```json
{
  "dependencies": {
    "@core/log-client": "^1.0.0"
  }
}
```

Add the package to the ``tsconfig.json``

```json
{
  "references": [
    {"path": "../../packages/log-client"}
  ]
}
```
## Initialize the Log Client

As the log client use the message queue connection,
so to make sure it works, we need to have the message
queue connection already connected (up and ready)
and use in the log client initialization.

```ts
// /src/log-client.ts
import type { Connection } from '@core/message-queue';
import logClient, { type Logger } from '@core/log-client';
import { LOG_EXCHANGE, NODE_ENV, APP_NAME } from './constants';

let logger: Logger;

export const initLogClient = (connection: Connection) => logClient({
  connection,
  logExchange: LOG_EXCHANGE,
  env: NODE_ENV,
  appName: APP_NAME,
}).then((pLogger: any) => {
  console.log('[x] Log client connected...');
  logger = pLogger;
});

export default function getLogger() {
  return logger;
}
```

The log client need to be initialized as the following. And,
note that the following example assumes the message queue
connection is up and ready to be used.

```ts
// /src/start-services.ts
import { type Connection } from '@core/message-queue';
import mqConnect from './message-queue';
import { initLogClient } from './log-client';

export default function startServices() {
  return mqConnect({
    onConnect: (connection: Connection) => {
      initLogClient(connection);
    },
  });
}
```

## Usage

To use the log client, we need to import the log client
and log as the following:

```ts
import logClient from './log-client';

export function writeUser() {
  // The processing part
  logClient().info({
    action: 'user.add',
    payload: { /* payload data */ },
  });
}
```
