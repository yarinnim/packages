import { parentPort } from 'worker_threads';
import jwt from 'jsonwebtoken';
import { VERIFY_TOKEN_EVENT_NAME as EVENT_NAME } from './config';

parentPort?.on('message', (message: any) => {
  const { token, publicKey, algorithm, issuer } = message;
  try {
    const decodedJwt = jwt.verify(token, publicKey, {
      algorithms: [algorithm],
      issuer: issuer,
    });

    parentPort?.postMessage({
      decodedJwt,
      eventName: EVENT_NAME,
      success: true,
    } as any);
  } catch (error: any) {
    const { message } = error;
    parentPort?.postMessage({
      eventName: EVENT_NAME,
      success: false,
      message,
    } as any);
  };
});

