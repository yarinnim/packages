/* eslint-disable no-console */
import { getMessage, writeConsoleLog } from './utils';
import getChannel from './channel';

type Env = 'development' | 'testing' | 'stagging' | 'production' | string;

export type LogClient = {
  connection: any,
  logExchange: string,
  appName: string,
  env: Env,
  debugMode?: boolean,
};

type Emit = CallableFunction;

export type Logger = {
  info: Emit;
  warn: Emit;
  error: Emit;
  log: CallableFunction;
};

let logClient: Logger;

const getConn = (conn: any) => ((typeof conn === 'function')
  ? conn()
  : conn);

const emit = (props: any, content: any) => {
  const { connection } = props;
  const conn = getConn(connection);
  if (!(conn || false)) {
    console.error('[ERROR] Log Client - MQ connection not available');
    return false;
  }

  const { logExchange, appName, env } = props;
  const { message, severity } = content;
  const timestamp = new Date();
  const data = {
    message: getMessage({ message }),
    timestamp,
    appName,
    env,
  };

  const { debugMode = false } = props;
  debugMode && writeConsoleLog(severity, data);

  const strData = JSON.stringify(data);

  return getChannel(conn, { logExchange })
    .then((channel: any) => {
      channel.publish(logExchange, severity, Buffer.from(strData));
      return channel;
    })
    .catch((error: any) => {
      const { message: errorMsg } = error;
      console.error('[ERROR] Log Client - %s - %s', errorMsg, new Date());
      return true;
    });
};

export const logger = () => logClient;

const getProps = (props: LogClient): LogClient => ({
   debugMode: false,
  ...props,
});

export default function initLogClient(pProps: LogClient): Logger {
  const props = getProps(pProps);
  logClient = {
    info: (message: any) => emit(props, { message, severity: 'info' }),
    warn: (message: any) => emit(props, { message, severity: 'warn' }),
    error: (message: any) => emit(props, { message, severity: 'error' }),
    log: (message: any, extraProps: any = {}) => {
      const { severity = 'info' } = extraProps;
      return emit(props, { message, severity });
    },
  };
  return logClient;
}
