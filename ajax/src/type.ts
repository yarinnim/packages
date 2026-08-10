export type DownloadProps = boolean | {
  filename: string,
};

export type CustomProps = {
  responseAsRaw?: boolean,
  download?: DownloadProps,
};

export type HeadersProps =  Record<string, any> | Function | CallableFunction;

export type RequestProps = {
  method?: string,
  headers?: HeadersProps,
  body?: Record<string, any> | FormData | any,
  query?: Record<string, any>,
};
