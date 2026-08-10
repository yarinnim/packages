export const connectionStorage = (value: boolean = false) => {
  let isConnected: boolean = value;
  return {
    set: (value: boolean) => (isConnected = value),
    get: () => isConnected,
  };
};

export const phoneCodeAttemptStorage = (value: number) => {
  let nRetries = value;
  return {
    decrease: () => --nRetries,
    get: () => nRetries,
  };
};
