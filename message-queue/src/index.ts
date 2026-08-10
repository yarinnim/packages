/* eslint-disable no-console */
import { type ChannelModel, connect as mqConnect } from 'amqplib';
import {
  getConnection, setConnection,
  isConnecting, setConnecting,
  getName, getConnectionString,
} from './common';
import type { MessageQueue, Options } from './type';

export type { ChannelModel, Channel } from 'amqplib';
export { getConnection, getConnectionCallback } from './common';
export type { MessageQueue, Options } from './type';

/**
 * Connect to message queue
 * @param {MessageQueue} props
 * @param {Options} options
 * @return ChannelModel
 */
function connectToMQ(props: MessageQueue, options: Options) {
  const strCon: string = getConnectionString(props);
  const { host } = props;
  const name = getName(props);
  return mqConnect(strCon)
    .then((conn: ChannelModel) => {
      setConnecting(name, false);
      console.log('[INFO] MQ Connection [%s] is connected - %s', name, new Date());
      const singletonConn = setConnection(name, conn);
      singletonConn.on('error', onError.bind(null, { props, options }));
      singletonConn.on('close', onError.bind(null, { props, options }));
      const { onConnect } = options;
      onConnect(singletonConn);
      return singletonConn;
    });
}

/**
 * Retries connect to rabbitmq again and again untill a specific max retry.
 * The interval of retrying is defined in the options parameter,
 * @param {MessageQueue} props
 * @param {Options} options
 */
const retry = (props: MessageQueue, options: Options, count: number = 1) => {
  const name = getName(props);
  setConnecting(name, true);
  const { maxRetry = 0 } = options;
  if (maxRetry > 0 && count >= maxRetry) {
    const { host } = props;
    console.log(`[WARNING] Give up retrying to MQ (${host})`);
    return false;
  }

  const { retryInterval = 5000 } = options;
  const timer = setTimeout(() => {
    clearTimeout(timer);
    const { host } = props;
    console.log(`[INFO] MQ - Retrying connect to ${host}...`);
    return connectToMQ(props, options).catch(() => {
      setConnecting(name, false);
      retry(props, options, count + 1);
    });
  }, retryInterval);
  return true;
};

type BindedProps = {
  props: MessageQueue,
  options: Options,
};

/**
 * Handle event on the error event
 * @param {BindedProps } bindedProps
 * @param {Error} error
 */
const onError = (pProps: BindedProps, error: any) => {
  const { props, options } = pProps;
  const name = getName(props);
  const { message } = error;
  console.error('[ERROR] %s - %s', message, new Date());
  setConnection(name, undefined);
  return retry(props, options);
};

export default function connect(props: MessageQueue, options: Options = {}): any {
  const name = getName(props);
  const singletonConn = getConnection(name);

  if (String(singletonConn) !== 'undefined') {
    const { onConnect = false } = options;
    if (onConnect) onConnect(singletonConn);
    return Promise.resolve(singletonConn);
  }

  if (isConnecting(name)) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        resolve(connect(props, options));
      }, 50);
    });
  }

  setConnecting(name, true);

  return connectToMQ(props, options);
}
