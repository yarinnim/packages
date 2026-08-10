const state: Record<string, any> = {};

export const getState = (key: string = '', defaultValue: any = undefined) => key === ''
  ? state
  : (state[key] || defaultValue);

export const setState = (key: string, value: any) => {
  state[key] = value;
  return state;
};

export const  removeState = (key: string) => {
  delete state[key];
  return state;
};
