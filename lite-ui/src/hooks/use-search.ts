import { useSearchParams } from 'react-router';
import createAutoFetch from './use-auto-fetch';

export default function useSearch(fetcher: CallableFunction, url: string, props: any = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = Object.fromEntries([...searchParams]);
  const autoFetch = createAutoFetch({ fetcher });
  const [result, request] = autoFetch(url, { ...props, query: queryString });

  const search = (evt: any) => {
    evt?.preventDefault();
    const target = evt.target;
    const formData = new FormData(evt.currentTarget);
    const params: any = Object.fromEntries(formData.entries());
    setSearchParams(params);
    return request(() => ({ ...props, query: target }));
  };

  const gotoPage = (page: number) => {
    const qs: any = { ...queryString, page };
    setSearchParams(qs);
    return request(() => ({ ...props, query: qs }));
  };

  return [
    { ...result, queryString },
    { search, gotoPage },
  ];
}
