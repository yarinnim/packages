# Event

The Event package is to facilitate the Event-Driven Architecture, where we have
the *Emitter* and *Receiver* actors on stage. This Event-Driven architecture uses
*RabbitMQ* as medium. So make sure you already have the *RabbitQM* service up and
running.  So, as the connection to *RabbitMQ* is very expensive, we strongly
recommend to use only on connection per architecture of this Event-Driven.

## Receiver/Event Server

Receiver (or we name it as *Event Server*) is the event receiving actor, which
listens to define event and will fire the event if the *Emitter* raises the event.
As we may have many event names the same names across the system, so we group
the *Event Server* by name.

### Register Events

To server the events, we need to register the event listener the event. The
following example is to create and event server under the ``order-event`` name,
and connects to the RabbitMQ of ``connection``.

```ts
import { eventReceiver } from '@core/event';

const eventServer = eventReceiver({
  connection,
  eventExchange: 'order-event',
});

export default function registerEvents(connection: MQConnection) {
  const { addEventListener } = eventServer;

  addEventListener('order.create', (order: any) => {
    console.log('New order created...');
  });

  addEventListener('order.cancel', (orderId: number, reason: any) =>  {
    console.log('Order cancelled');
    console.table({ orderId, reason });
  });
}
```

## Emitter

Emitter is the event raiser. It publishes an event to RabbitMQ so the
*Event Receiver* can execute the registered listeners. The *Emitter* must
connect to the same *RabbitMQ* and use the same ``eventExchange`` as the
*Event Receiver*; otherwise the event will not be delivered.

### Initialize Event Emitter

Call ``eventEmitter`` once with a RabbitMQ connection and exchange name.
It returns a function you can reuse to publish events.

```ts
import mq, { getConnectionCallback } from '@core/message-queue';
import { eventEmitter } from '@core/event';

const EVENT_EXCHANGE = 'order-event';

mq({ host, port, user, password, name: EVENT_EXCHANGE }, { onConnect: () => true });

export default function initEventEmitter() {
  return eventEmitter({
    connection: getConnectionCallback(EVENT_EXCHANGE),
    eventExchange: EVENT_EXCHANGE,
  });
}
```

### Emit an Event

The initialized emitter accepts an event name, payload, and optional headers.

```ts
import initEventEmitter from './event';

const emit = initEventEmitter();

emit('order.create', { id: 1, total: 99.5 });

emit('order.cancel', { orderId: 1, reason: 'out of stock' }, {
  headers: { source: 'checkout-service' },
});
```

| Property | Type | Description |
| --- | --- | --- |
| ``connection`` | ``Connection`` or ``CallableFunction`` | RabbitMQ connection or a callback that returns it |
| ``eventExchange`` | ``string`` | Exchange name shared with the *Event Receiver* |

When the RabbitMQ connection is unavailable, the emitter returns
``{ error: true, message: 'MQ Connection down.' }`` instead of publishing.
