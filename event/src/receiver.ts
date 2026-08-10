/* eslint-disable no-console */
// import connectMQ from '@core/message-queue';
import { storeEvent, executeEvents } from './event';
import getChannel from './channel';
import type { EventReceiverProps, EventReceiver } from './type';


let queuePrv: any;

const getConn = (conn: any) => ((typeof conn === 'function')
  ? conn()
  : conn);

/**
 * Decodes the RabbitMQ message content into JS Object
 * @param {Buffer|string} content - The RabbitMQ mesage
 * @return any
 */
const decodeMessage = (content: any) => JSON.parse(content.toString());

/**
 * Initialize the queue, if the queue already exists or initialized,
 * the existing queue will be used, instead of creating a new one.
 * If the queue not exist, create a new queue, and consuming this queue.
 * @param {Object} props - Binded props from the parent
 * @return created queue
 */
const initQueue = (props: any, channel: any) => {
  if (String(queuePrv) !== 'undefined') {
    return Promise.resolve({
      channel,
      queue: queuePrv,
    });
  }

  const { eventExchange } = props;
  return channel
    .assertQueue('', { exclusive: true })
    .then((queue: any) => {
      console.log('[INFO] New queue created [%s] - %s', queue.queue, new Date());
      queuePrv = queue;
      channel.consume(queue.queue, (message: any) => {
        const { fields, content } = message;
        const { routingKey: eventName } = fields;
        const { data } = decodeMessage(content);
        executeEvents(eventExchange, eventName, data);
      }, { noAck: true });
      return { channel, queue: queuePrv };
    });
};

const initSubscriber = (props: EventReceiverProps, eventName: string, callback: CallableFunction) => {
  const { connection } = props;
  return getChannel(connection)
    .then((ch: any) => {
      const { eventExchange } = props;
      ch.assertExchange(eventExchange, 'topic', { durable: false });
      return ch;
    })
    .then(initQueue.bind(null, props))
    .then((result: any) => {
      const { channel, queue } = result;
      const { eventExchange } = props;
      storeEvent(eventExchange, { name: eventName, callback });
      return channel
        .bindQueue(queue.queue, eventExchange, eventName)
        .then((bindedChannel: any) => {
          console.log('[INFO] Register event "%s"', eventName);
          return bindedChannel;
        })
        .catch(() => {
          queuePrv = undefined;
          return initSubscriber(props, eventName, callback);
        });
    });
};

function addEventListener(props: EventReceiverProps, eventName: string, callback: CallableFunction) {
  const { connection } = props;
  const conn = getConn(connection);
  if (!(conn || false)) throw new Error('MQ connection is not valid.');
  return initSubscriber({ ...props, connection: conn }, eventName, callback);
}

const removeEventListener = (props: EventReceiverProps, name: string) => ({ props, name });

export default function eventRceiver(props: EventReceiverProps): EventReceiver {
  return {
    addEventListener: addEventListener.bind(null, props),
    removeEventListener: removeEventListener.bind(null, props),
  };
}
