import { type ChannelModel } from 'amqplib';
import type { MessageQueue, Options } from './type';

type ConnState = {
  connection?: ChannelModel;
  isConnecting?: boolean;
};

const singletonConn: Record<string, ConnState> = {};

const getConn = (name: string): ConnState => {
  if (name === '' || String(name) === 'undefined') {
    const keys = Object.keys(singletonConn);
    if (keys.length === 0) return {};
    const [key] = keys;
    return singletonConn[key];
  }

  return singletonConn[name] || {};
};

const setConn = (name: string, conn: ConnState) => {
  singletonConn[name] = conn;
  return singletonConn[name];
};

/**
 * Gets the connction name of a specific host
 */
export const getName = (props: MessageQueue): string => {
  const { host, name = false } = props;
  return name || host;
};

/**
 * Gets the connection of the host by name
 * @param {string} name - The ChannelModel name
 * @returns Conneciton
 */
export const getConnection = (name: string = ''): ChannelModel | undefined => {
  const { connection = undefined } = getConn(name);
  return connection;
};

export const getConnectionCallback = (name: string): CallableFunction => getConnection
  .bind(null, name);

export const setConnection = (name: string, con: ChannelModel | any): ChannelModel => {
  const conn = getConn(name);
  const touchedConn = { ...conn, connection: con };
  setConn(name, touchedConn);
  return con;
};

/**
 * Gets the current status of the current connection
 * whether it is connecting or not
 * @param {string} name - The connection name
 * @return boolean
 */
export const isConnecting = (name: string = ''): boolean => {
  const { isConnecting: state = false } = getConn(name);
  return state;
};

/**
 * Sets the connecting status to speicfic connection name
 * @param {string} name - The conneciton name
 * @param {boolean} state - State to identify if it is connecting or not
 */
export const setConnecting = (name: string, state: boolean) => {
  const conn = getConn(name);
  const touchedConn = { ...conn, isConnecting: state };
  setConn(name, touchedConn);
};

/**
 * Get the connection string from configruation
 * @param {MessageQueue} connection - The message queue connection
 * @param props
 * @return string - String to Message Queue
 */
export const getConnectionString = (connection: MessageQueue): string => {
  const {
    host,
    port,
    user,
    password,
  } = connection;
  return `amqp://${user}:${password}@${host}:${port}`;
};
