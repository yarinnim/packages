export type ClientProps = {
  appId: string;
  apiUrl: string;
  secretKey: string;
  fetcher: any;
  tokenLife?: number;
};

export type ServerProps = {
  databasePool: any,
  privateKey: string,
};

type ValidateProps = {
};

export type Server = {
  validate: (_props: ValidateProps) => Promise<any>;
}
