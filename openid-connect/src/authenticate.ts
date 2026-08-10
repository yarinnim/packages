// import jwt from 'jsonwebtoken';
import { Worker } from 'worker_threads';
import { VERIFY_TOKEN_EVENT_NAME as EVENT_NAME } from './config';

type Auth = {
  providerUrl: string,
  realm: string,
  publicKey: string;

  algorithm?: string,
  authKey?: string;
};

let _key: string = '';
const getPubKey = (publicKey: string): string => {
  if (_key !== '') return _key;
  _key = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
  return _key; 
};

const verifyKey = (authorization: string): string => {
  if (!authorization) throw new Error('Authorization header is required.');

  const tokenParts = authorization.split(' ');
  const hasBearerPrefix = (tokenParts[0] === 'Bearer');
  if (!hasBearerPrefix) throw new Error('Invalid authorization format.');

  const token = tokenParts[1];
  if (!token) throw new Error('Token is required.');

  return token;
};

const getAuth = (decodedJwt: any) => {
  const { email, name, sub: userId, ...auth } = decodedJwt;
  return {
    userId,
    name,
    email,
    preferredUsername: auth.preferred_username,

    givenName: auth.given_name,
    familyName: auth.family_name,
    access: {
      realm: auth.realm_access,
      resource: auth.resource_access,
    },
  };
};

const sendToWorker = (props: any) => new Promise((resolve, reject) => {
  const workerModule = `${__dirname}/authenticate-worker.js`;
  const worker = new Worker(workerModule);
  worker.postMessage({ ...props, eventName: EVENT_NAME });
  worker.on('error', reject);
  worker.on('message', (eventMessage: any) => {
    const { success } = eventMessage;
    worker.terminate();
    if (!success) {
      const { message } = eventMessage;
      return reject({ message });
    };

    const { decodedJwt } = eventMessage;
    return resolve(decodedJwt);
  });
});

export default function authenticate(auth: Auth) {
  return (req: any, res: any, next: any) => {
    try {
      const authorization = req.headers.authorization || ''; const jwtToken = verifyKey(authorization);
      const { algorithm = 'RS256' } = auth;
      const publicKey = getPubKey(auth.publicKey);
      const issuer = `${auth.providerUrl}/realms/${auth.realm}`;

      const workerMessage = {
        publicKey,
        algorithm,
        token: jwtToken,
        issuer,
      };

      return sendToWorker(workerMessage)
        .then((decodedJwt: any) => {
          const authUser = getAuth(decodedJwt);
          req[auth.authKey || 'auth'] = authUser;
          return next();
        })
        .catch((error: any) => {
          console.log({ error });
          const { message } = error;
          return res.status(401).json({
            message,
            at: new Date().getTime(),
          });
        });
    } catch (error: any) {
      const { message } = error;
      return res.status(401).json({
        message,
        at: new Date().getTime(),
      });
    };
  };
}
