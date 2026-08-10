import { createHash, createCipheriv, createDecipheriv } from 'crypto';

type Crypto = {
  method?: string; // aes-256-cbc
  algorithm?: string; // sha512
  secretKey: string;
};

const getCrypto = (props: Crypto): Crypto => ({
  method: 'aes-256-cbc',
  algorithm: 'sha256',
  ...props,
});

export function encodeObject(props: Record<string, any> = {}): string {
  return createHash('sha256')
    .update(JSON.stringify(props))
    .digest('hex');
}

function generateKey(props: Crypto): [string, string] {
  const { algorithm, secretKey }: any = getCrypto(props);
  const hashed = createHash(algorithm)
    .update(secretKey)
    .digest('hex');
  return [hashed.substring(0, 32), hashed.substring(0, 16)];
}

export function encode(data: string, props: Crypto) {
  const { method }: any = getCrypto(props);
  const [key, encIV] = generateKey(props);
  const cipher = createCipheriv(method, key, encIV);
  return Buffer
    .from(`${cipher.update(data, 'utf8', 'hex')}${cipher.final('hex')}`)
    .toString('base64');
}

export function decode(hashedContent: string, props: Crypto) {
  const { method }: any = getCrypto(props);
  const [key, cipher] = generateKey(props);
  const buffer = Buffer.from(hashedContent, 'base64');
  const decipher = createDecipheriv(method, key, cipher);

  const pre = decipher.update(buffer.toString('utf8'), 'hex', 'utf8');
  const suf = decipher.final('utf8');
  return `${pre}${suf}`;
}
