/* eslint-disable no-console */
import { io, type Socket } from 'socket.io-client';

export type Client = Socket & {
  joinRoom?: CallableFunction;
  onJoinRoom?: CallableFunction;
};

let socket: Client;

export type SocketClientProps = {
  namespace: string,
  appId: string;
  secretKey: string;
  path?: string;
};

const getAuth = (props: SocketClientProps) => {
  const { namespace, appId, secretKey } = props;
  return { namespace, appId, secretKey };
};

const getQuery = (props: SocketClientProps) => {
  const { appId } = props;
  return { appId };
};

const onConnectError = (error: any) => {
  const { message = false, context = {} } = error;
  const { responseText = false, statusText = false } = context;
  const errorMessage = message || statusText || responseText || 'unknown error';
  console.error('[ERROR] Socket Client - %s', errorMessage.toString());
};

const isActive = (pSocket: Client) => {
  if (!(pSocket || false)) return false;
  return true;
};

const onRoomJoint = (room: string) => {
  console.log('[INFO] Client joint the room %s', room);
};

export default function socketClient(host: string, props: SocketClientProps): Client {
  const isConnected = isActive(socket);

  if (isConnected) return socket;

  const { path = '/socket.io' } = props;
  const auth = getAuth(props);
  const query = getQuery(props);
  const { namespace } = props;
  socket = io(`${host}/${namespace}`, { auth, query, path });
  socket.on('connect_error', onConnectError);
  socket.on('disconnect', onConnectError);

  console.log('[INFO] Socket client connected - %s ', new Date());

  socket.joinRoom =  onRoomJoint;
  socket.onJoinRoom = () => { socket.on('room-joint', console.table); };
  return socket;
}
