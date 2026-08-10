import initClient, { type Client, type SocketClientProps as Props } from '../index';

export default function init(): Client {
  const host = 'ws://localhost:3000';
  const conf: Props = {
    namespace: 'fdasfdasfdasfa',
    appId: 'fc6a7274-b51d-48ef-ba75-637e3ec7aba0',
    secretKey: '190a9d3bfbb5ed31a4c72aec6a4a2de519df13e7d26dc73c5be1cd9ac0389daa',
  };

  return initClient(host, conf);
}
