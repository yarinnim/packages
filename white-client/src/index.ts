import { verify } from 'jsonwebtoken';
import { find } from './models/integrated-app.model';
import { initConfig } from './config';
import { hashBody } from './signature';
import type { ServerProps, Server } from './type';
export type { ClientProps, ServerProps, Server } from './type';
export { default as client } from './client';

const verifyToken = (token: string, props: any) => {
  const { app, path, method } = props;
  const { secretKey, ...restApp } = app;
  const result: any = verify(token, secretKey);
  const { iat } = result;
  const now = new Date().getTime();
  const elipse = (now - iat);

  if (elipse > 5000) throw {
    message: 'Token already expired.',
    code: 'TOKEN_EXPIRED',
  };

  if (method.toUpperCase() !== result.method?.toUpperCase()) throw {
    message: 'Invalid method in token',
    code: 'METHOD_NOT_MATCH',
  };

  if (method.toUpperCase() !== 'GET') {
    const { body } = props;
    const hashedBody = hashBody(secretKey, body || {});
    if (hashedBody !== result.body) throw {
      message: 'Invalid body request',
      code: 'BAD_HASHED_BODY',
    };
  }

  if (path !== result.path) throw {
    message: 'Invalid path in token',
    code: 'PATH_NOT_MATCH',
  };

  return restApp;
};

function validate(props: ServerProps, request: any): Promise<any> {
  const { path, headers, method, body = {} } = request;
  const { 'app-id': appId = false, authorization = false } = headers;

  if (!appId) return Promise.reject({
    message: 'App ID not provided.',
    code: 'APP_ID_REQUIRED',
  });

  if (!authorization) return Promise.reject({
    message: 'Authorization bearer token required.',
    code: 'AUTHORIZATION_REQUIRED',
  });

  const [, token = ''] = authorization.split(' ');
  if (token.length <= 0) return Promise.reject({
    message: 'Invalid authorization bearer token',
    code: 'INVALID_AUTHORIZATION_TOKEN',
  });

  return find(appId).then((app: any = false) => {
    if (!app) throw({
      message: 'Invalid App information',
      code: 'APP_NOT_FOUND',
    });

    return verifyToken(token, { app, body, path, method });
  }).then((result: any) => {
    request.client = result;
    return result;
  });
}

export default function initServer(props: ServerProps): Server {
  initConfig(props);
  return {
    validate: validate.bind(null, props),
  };
}
