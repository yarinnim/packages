import Keycloak, { type KeycloakInitOptions } from 'keycloak-js';
import {
  getTokens,
  storeTokens,
  removeToken,
} from '../token';
import {
  isSessionRevoked as isSessionRevokedInStorage,
  revokeSession,
  clearSession,
} from '../session';
import { getDefaultRedirectUri, isOAuthCallbackUrl } from '../url';

export type AuthClient = Keycloak;

type AuthClientProps = {
  url: string;
  realm: string;
  clientId: string;
};

type AuthSuccessListener = () => void;

let authSuccessListener: AuthSuccessListener | null = null;

let client: AuthClient | null = null;
let clientKey = '';
let sharedInitPromise: Promise<boolean> | null = null;
let sessionRevoked = false;

export const setAuthSuccessListener = (
  listener: AuthSuccessListener | null,
): void => {
  authSuccessListener = listener;
};

export const resetKeycloakSessionInit = (): void => {
  sharedInitPromise = null;
};

export const markSessionRevoked = (): void => {
  sessionRevoked = true;
  revokeSession();
};

export const clearSessionRevoked = (): void => {
  sessionRevoked = false;
  clearSession();
};

export const isSessionRevoked = (): boolean =>
  sessionRevoked || isSessionRevokedInStorage();

export const getClient = (): AuthClient | null => client;

export const resolveAuthenticated = (authClient: AuthClient): boolean => {
  if (isSessionRevoked()) return false;
  return Boolean(authClient.authenticated);
};

const buildKeycloakInitOptions = (
  silentCheckSsoRedirectUri?: string,
): KeycloakInitOptions => {
  const initOptions: KeycloakInitOptions = {
    pkceMethod: 'S256',
    checkLoginIframe: false,
  };

  const hadCallback = isOAuthCallbackUrl();
  const stored = getTokens();
  const hasStoredSession = Boolean(stored.token && stored.refreshToken);

  if (hasStoredSession && !hadCallback) {
    initOptions.token = stored.token ?? undefined;
    initOptions.refreshToken = stored.refreshToken ?? undefined;
    if (stored.idToken) initOptions.idToken = stored.idToken;
    return initOptions;
  }

  if (silentCheckSsoRedirectUri) {
    initOptions.onLoad = 'check-sso';
    initOptions.silentCheckSsoRedirectUri = silentCheckSsoRedirectUri;
  }

  return initOptions;
};

const runKeycloakInit = (
  authClient: AuthClient,
  silentCheckSsoRedirectUri?: string,
): Promise<boolean> => {
  if (authClient.didInitialize) {
    if (!sharedInitPromise) {
      sharedInitPromise = Promise.resolve(resolveAuthenticated(authClient));
    }
    return sharedInitPromise;
  }

  if (!sharedInitPromise) {
    const initOptions = buildKeycloakInitOptions(silentCheckSsoRedirectUri);
    sharedInitPromise = authClient.init(initOptions)
      .then(() => resolveAuthenticated(authClient))
      .catch((error: Error) => {
        removeToken();
        throw error;
      });
  }
  return sharedInitPromise.catch((error: Error) => {
    sharedInitPromise = null;
    throw error;
  });
};

export const waitForKeycloakReady = (
  authClient: AuthClient,
  redirectUri: string,
  silentCheckSsoRedirectUri?: string,
): Promise<void> => {
  authClient.redirectUri = redirectUri;
  return runKeycloakInit(authClient, silentCheckSsoRedirectUri).then(() => undefined);
};

export const initKeycloakSession = (
  authClient: AuthClient,
  redirectUri: string,
  silentCheckSsoRedirectUri?: string,
): Promise<boolean> => {
  authClient.redirectUri = redirectUri;
  return runKeycloakInit(authClient, silentCheckSsoRedirectUri);
};

const wireKeycloakHandlers = (authClient: AuthClient): void => {
  authClient.onAuthSuccess = () => {
    if (isSessionRevoked()) return;
    const { token: accessToken } = authClient;
    if (!accessToken) return;
    storeTokens(authClient);
    if (authSuccessListener) authSuccessListener();
  };

  authClient.onTokenExpired = () => authClient.updateToken(30)
    .then((refreshed: boolean) => {
      if (isSessionRevoked() || !refreshed || !authClient.token) return;
      storeTokens(authClient);
    })
    .catch(() => {
      if (isSessionRevoked()) return;
      removeToken();
      authClient.redirectUri = getDefaultRedirectUri();
    });
};

export default function initClient(props: AuthClientProps): AuthClient {
  const { url, realm, clientId } = props;
  const configKey = btoa([url, realm, clientId].join('|'));

  if (!(url || false)) throw new Error('Auth URL is missing');
  if (!(realm || false)) throw new Error('Please provide auth realm.');
  if (!(clientId || false)) throw new Error('Invalid Auth Client ID.');

  if (client && clientKey === configKey) return client;

  clientKey = configKey;
  sharedInitPromise = null;
  sessionRevoked = isSessionRevokedInStorage();

  client = new Keycloak(props);
  wireKeycloakHandlers(client);
  return client;

};
