# Integration

How to integrate into the server/api that install this white-client
to allow only specific client (white-listing client). Each client
needs to ship with the following information in the `headers` for
each request.

- `Authorziation`: JTW Token
- `App-ID`: The registered App ID as UUID v4.

## How To Generate JTW

When integrate into, you will be provided the following information:

- **Application ID**: The registered app ID as UUID v4
- **Secret Key**: Secure key used for hashing (keep this in secure place).

To generate the **JTW Authorziation**, you need to sign the JWT to sign
using the following combination keys:

- `path`: The URL to request to `/users`
- `mthod`: The HTTP Method
- `iat`: Unix timestamp of time the request is initialized
- `body`: The hashed body content using the provided `secret key` to hash.

### How to Hash Body

Body is sent to the server using JSON formation, and to hash the body to be
used in the Authorziation JTW, you need to:

- Create Hmac Object using `sha256` algorithm with `secret key`.
- Convert it to `hex`.

## Example

```ts
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

const hashBody = (secretKey: string, body: any = {}) => {
  const hmac = crypto.createHmac(algorithm, secretKey);
  hmac.update(JSON.stringify(body));
  const hashedBody = hmac.digest('hex');
  return hashedBody;
};

const createSignature = (props: Entities) => {
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

const path = '/users';
const method = 'POST';
const appId = '5d416384-3781-4bd3-bcba-de195cb8c28e';
const secretKey: '1ad5a94efe28ecec4055dc0178d18024';
const body = { firstName: 'Dara', lastName: 'HENG' };
const iat = new Date().getTime();

const hashedBody = hashBody(secretKey, body);
const jtw = createSignature({
  iat,
  path,
  method,
  body: hashedBody,
});

const headers = {
  'app-id': appId,
  'authorization': `Bearer ${jtw}`,
};

const url = `https://testing-domain.com${path}`;
return fetch(url, { headers, method, body });
```
