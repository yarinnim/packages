# Message Queue

The message queue package serves the message queue connection
at the current version, it uses the **RabbitMQ** server as the medium.
## Installation
Add package into the ``package.json`` as the following:

```json
{
  "dependencies": {
    "@core/message-queue": "^1.0.0"
  }
}
```

And add the package path into the ``tsconfig.json`` as the following:

```json
{
  "references": [
    {"path": "../../packages/message-queue"}
  ]
}
```

## Initialization

The message queue initialization need to have the message queue server
connection information.

```ts
import mq, { type Options, type Connection } from '@core/message-queue';

export default function connect(options: Options) {
  const connectionProps = {
    host: 'localhost',
    port: 5672,
    user: 'rabbitmq',
    password: 'rabbitmq',
  };
  return mq(connectionProps, {
    onConnect: (connection: Connection) => {
      console.log('[x] Message queue connected...');
      console.log({ connection });
    }
  });
}
```