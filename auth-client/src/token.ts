import { parseJwt } from './jwt';

const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const ID_TOKEN_KEY = 'auth_id_token';
const KEYCLOAK_CALLBACK_PREFIX = 'kc-callback-';

export type StoredSessionTokens = {
  token: string | null,
  refreshToken: string | null,
  idToken: string | null,
};

type KeycloakTokenSource = {
  token?: string,
  refreshToken?: string,
  idToken?: string,
};

export const getTokens = (): StoredSessionTokens => ({
  token: localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  idToken: localStorage.getItem(ID_TOKEN_KEY),
});

export const isValidToken = (): boolean => {
  const token  = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return false;

  const decoded = parseJwt(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 > Date.now();
};

export const storeTokens = (source: KeycloakTokenSource): void => {
  const { token, refreshToken, idToken } = source;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (idToken) localStorage.setItem(ID_TOKEN_KEY, idToken);
};

export const removeToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
};

export const clearCallbackTokens = (): void => {
  const keysToRemove = Object.keys(localStorage).filter(
    (key: string) => key.startsWith(KEYCLOAK_CALLBACK_PREFIX),
  );
  keysToRemove.forEach((key: string) => localStorage.removeItem(key));
};

