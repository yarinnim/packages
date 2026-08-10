import crypto from 'crypto';
import { sign } from 'jsonwebtoken';

const algorithm = 'sha256';

type Entities = {
  path: string,
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH',
  body?: Record<string, any>,
  appId: string,
  secretKey: string,
}

export const hashBody = (secretKey: string, body: any = {}) => {
  const hmac = crypto.createHmac(algorithm, secretKey);
  hmac.update(JSON.stringify(body));
  const hashedBody = hmac.digest('hex');
  return hashedBody;
};

export default function createSignature(props: Entities){
  const { path, method = 'GET', body = {}, secretKey } = props;
  const timestamp = new Date().getTime();

  const payload = {
    path, 
    iat: timestamp, 
    method: method.toUpperCase(), 
    body: hashBody(secretKey, body),
  };
  return sign(payload, secretKey);
};

