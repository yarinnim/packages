let privConfig: any = {};

export const getConfig = (): any => privConfig;

export const initConfig = (config: any) => {
  privConfig = { ...config };
  return privConfig;
};
