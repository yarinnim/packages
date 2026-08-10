import { useEffect, useState } from 'react';
import type { FetchProps, FetchHook } from './type';

/**
 * Creates the auto fetching, which make the fetch when the
 * component is mounted
 * @member {callback} fetcher - The ajax requester
 */
export default function createFetch(fetcherProps: FetchProps) {
  const { fetcher } = fetcherProps;

  return (url: string, props: Record<string, any> = {}): FetchHook => {
    let isMounted = false;
    const [response, setResponse] = useState({ response: {}, error: false });
    const [isAwait, setAwait] = useState(false);

    const refetch = (pNewProps?: CallableFunction | any) => {
      const newProps = typeof pNewProps === 'function'
        ? pNewProps(props)
        : pNewProps;

      const mergedProps = { ...props, ...newProps };
      setAwait(true);
      fetcher(url, mergedProps)
        .then((res: any) => {
          setResponse({ response: res, error: false });
        })
        .catch((error: any) => {
          setResponse({ error, response: {} });
        })
        .finally(() => {
          setAwait(false);
        });
    };

    useEffect(() => {
      isMounted = true;
      if (isMounted) refetch();

      return () => {
        isMounted = false;
      };
    }, []);

    return [{ ...response, isAwait }, refetch];
  };
}
