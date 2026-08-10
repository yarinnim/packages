export type FetchState = {
  isAwait: boolean,
  error?: any,
  response?: any,
};

export type FetchHook = [FetchState, CallableFunction];

export type FetchProps = {
  fetcher: any,
};
