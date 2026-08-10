import createSignature from '../signature';
import type { ClientProps } from '../type';

const getHeaders = (config: any, path: string, props: any = {}) => {
  const { appId, secretKey } = config;
  const { method, headers = {}, body = {} } = props;
  const signature = createSignature({
    path, appId, secretKey,
    method, body,
  });

  return {
    ...headers,
    'app-id': appId,
    Authorization: `Bearer ${signature}`,
  };
};

const getProps = (props: any = {}) => ({
  method: 'GET',
  headers: {},
  body: {},
  ...props,
});

function request(config: ClientProps, path: string, pProps: any = {}) {
  const { fetcher, apiUrl, ...restConfig } = config;
  const props = getProps(pProps);
  const touchedHeaders = getHeaders(restConfig, path, props); 
  const reqUrl = `${apiUrl}${path}`;
  return fetcher(reqUrl, {
    ...props,
    headers: touchedHeaders,
  });
}

export default function initClient(props: ClientProps) {
  return request.bind(null, props);
}
