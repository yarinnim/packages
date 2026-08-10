/* eslint-disable no-console */
import type { Channel, ChannelModel } from 'amqplib';

let channelPrv: Channel;
let channelInitializing: boolean = false;

type ChannelProps = {
  connection: ChannelModel;
  isSingleton?: boolean;
}

const setChannel = (value: any) => {
  channelPrv = value;
  return channelPrv;
};

function onChannelError(conn: ChannelModel, error: any) {
  const { message = 'unknow' } = error || {};
  console.error('[ERROR] %s - %s', message, new Date());
  setChannel(undefined);
  channelInitializing = false;
}

const initSingleton = (conn: ChannelModel): Promise<Channel> => {
  if (String(channelPrv) !== 'undefined') return Promise.resolve(channelPrv);

  if (channelInitializing) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        return resolve(initSingleton(conn));
      }, 50);
    });
  }

  channelInitializing = true;
  return conn
    .createChannel()
    .then((ch: Channel) => {
      channelInitializing = false;
      channelPrv = ch;
      ch.on('error', onChannelError.bind(null, conn));
      ch.on('close', onChannelError.bind(null, conn));
      return channelPrv;
    });
};

export default function initChannel(props: ChannelProps): Promise<Channel> {
  const { isSingleton = false, connection } = props;
  if (!isSingleton) return connection.createChannel();
  return initSingleton(connection);
}
