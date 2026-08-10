type DeviceId = string | false;

let deviceId: DeviceId = false;
const STORAGE_KEY: string = 'device-id';
const LANG_KEY: string = 'locale';
const AUTH_KEY: string = 'access-token';
const DEFAULT_LANG: string = 'en-US';

const getLocalStorage = () => {
  try {
    return localStorage;
  } catch (_error) {
    return false;
  }
};

export const getAccessToken = (): string => {
  const localStorage = getLocalStorage();
  if (!(localStorage || false)) return '';
  return localStorage.getItem(AUTH_KEY) || '';
};

export const generateUUID = (): string => {
  try {
    const id = crypto.randomUUID();
    return id;
  } catch (_error) {
    const eId = new Date().getTime();
    return eId.toString();
  }
};

export const getUserLang = () => {
  const localStorage = getLocalStorage();
  if (localStorage || false) {
    const locale = localStorage.getItem(LANG_KEY);
    if (locale || false) return locale;
  }
  const { language = false, userLanguage = false } = { ...(navigator || {}) };
  const nav = language || userLanguage || Intl?.DateTimeFormat?.().resolvedOptions?.().locale;
  return nav || DEFAULT_LANG;
};

const getFromLocalStorage = (): DeviceId => {
  const localStorage = getLocalStorage();
  if (!(localStorage || false)) return false;

  deviceId = localStorage.getItem(STORAGE_KEY) || false;
  if (deviceId) return deviceId;

  deviceId = generateUUID();
  localStorage.setItem(STORAGE_KEY, deviceId);
  return deviceId;
};

export const getDeviceId = (): string  => {
  if (deviceId || false) return deviceId;

  deviceId = getFromLocalStorage();
  if (deviceId || false) return deviceId;

  deviceId = generateUUID();
  return deviceId;
};
