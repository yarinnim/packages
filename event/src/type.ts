/* eslint-disable no-unused-vars */

type Connection = {
  host: string;
  port: number | string;
  user: string;
  password: string;
} | any;

/**
 * The type of initialing the Event Emitter
 * @member connection - The MQ Connection
 * @member receiver - The exchange name, this is used as event destination
 */
export type EventEmitterProps = {
  connection: Connection;
  eventExchange: string;
};
/**
 * @member connection - The RabbitMQ connection
 * @member  eventExchange - Name of event host/emitter it listens to
 */
export type EventReceiverProps = {
  connection: CallableFunction | any;
  eventExchange: string;
};

export type EventReceiver = {
  addEventListener: (eventName: string, onEvent: CallableFunction) => void;
  removeEventListener: (eventName: string) => void;
};

