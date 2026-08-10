import { useState } from 'react';
import type { FetchHook, FetchProps } from './type';

/**
 * The request to defined url and props
 * @param {any} bindedConfig - The fetch bindedConfiguration
 * @param {string} replacedUrl - If the url need to be replaced
 * @param {any} replaceProps - If the request properies need to be customized
 *
 * @return Promise|false
 */
const request = (
  bindedConfig: any = {},
  overrideUrl: string = '',
  overwriteProps: any = {},
) => {
  const { isAwait } = bindedConfig;
  if (isAwait) return false;
  const {
    setAwait,
    fetcher,
    url,
    props,
    setState,
  } = bindedConfig;
  setAwait(true);
  setState({});
  const reqProps: any = { ...props, ...overwriteProps };
  return fetcher(overrideUrl || url, reqProps)
    .then((response: any) => {
      setState({ response });
      return response;
    })
    .catch((error: any) => {
      setState({ error });
      // throw error;
    })
    .finally(() => {
      setAwait(false);
    });
};

/**
 * Create the fetching hook with fetch (ajax requester)
 * @member {ajax} fetcher - The Ajax Http requester
 * @member {boolean} isSync - [false] If the request is the Asyn or Sync
 */
export default function createUseFetch(pProps: FetchProps) {
  const { fetcher } = pProps;
  return (url: string = '', props: any = {}): FetchHook => {
    const [isAwait, setAwait] = useState(false);
    const [state, setState] = useState({});
    const config = {
      fetcher,
      url,
      props,
      setState,
      isAwait,
      setAwait,
    };
    return [{ ...state, isAwait }, request.bind(null, config)];
  };
}
