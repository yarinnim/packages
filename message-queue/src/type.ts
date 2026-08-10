export type MessageQueue = {
  host: string;
  port: string | number;
  user: string;
  password: string;
  name?: string; // The connection name, host will be used if not defined
};

export type Options = {
  retryInterval?: number; // Interval to make another retry
  maxRetry?: number; // How many retry will perforam
  singleton?: boolean; // Use only one connection for all

  onConnect?: any;
  onRetry?: any;
  onClose?: any;
};
