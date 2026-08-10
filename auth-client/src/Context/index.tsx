import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import initClient, {
  clearSessionRevoked,
  initKeycloakSession,
  isSessionRevoked,
  resolveAuthenticated,
  setAuthSuccessListener,
  waitForKeycloakReady,
  resetKeycloakSessionInit,
} from '../client';
import { changePassword as changePasswordSession } from '../change-password';
import { logout as logoutSession } from '../logout';
import { storeTokens, clearCallbackTokens } from '../token';
import {
  clearOAuthFromAddressBar,
  getDefaultRedirectUri,
  getSilentCheckSsoRedirectUri,
  isOAuthCallbackUrl,
} from '../url';

type AuthClient = ReturnType<typeof initClient>;

type AuthContextState = {
  token?: string | null;
  isAwait: boolean;
  isAuthenticated: boolean;
};

type AuthContextAction = {
  redirectToLogin: () => void;
  logout: () => void;
  changePassword: () => void;
};

export type AuthContextType = [AuthContextState, AuthContextAction];

type AuthProviderProps = React.PropsWithChildren<{
  providerUrl: string;
  realm: string;
  clientId: string;
  redirectUri?: string;
  silentCheckSsoRedirectUri?: string;
}>;

type LoginOptions = {
  redirectUri: string,
  prompt?: 'login',
  maxAge?: number,
};

type AuthProviderPropsWithDefault = AuthProviderProps
  & Required<Pick<AuthProviderProps, 'redirectUri' | 'silentCheckSsoRedirectUri'>>;

const buildInitialAuthState = (): AuthContextState => ({
  token: null,
  isAuthenticated: false,
  isAwait: true,
});

const defaultAuthAction: AuthContextAction = {
  logout: () => true,
  redirectToLogin: () => true,
  changePassword: () => true,
};

const AuthContext = createContext<AuthContextType>([
  buildInitialAuthState(),
  defaultAuthAction,
]);

const persistSessionToken = (authClient: AuthClient): void => {
  const { token } = authClient;
  if (!token) return;
  storeTokens(authClient);
};

const finishOAuthCallback = (hadCallback: boolean, failed: boolean): void => {
  if (!hadCallback) return;
  clearOAuthFromAddressBar();
  if (failed) resetKeycloakSessionInit();
};

const getProps = (pProps: AuthProviderProps): AuthProviderPropsWithDefault => {
  const redirectUri = pProps.redirectUri ?? getDefaultRedirectUri();
  return {
    ...pProps,
    redirectUri,
    silentCheckSsoRedirectUri: pProps.silentCheckSsoRedirectUri
      ?? getSilentCheckSsoRedirectUri(redirectUri),
  };
};

export function AuthProvider(pProps: AuthProviderProps) {
  const props = getProps(pProps);
  const {
    providerUrl,
    realm,
    clientId,
    redirectUri,
    silentCheckSsoRedirectUri,
    children,
  } = props;
  const connection = { url: providerUrl, realm, clientId };
  const client = initClient(connection);
  const redirectUriRef = useRef(redirectUri);
  redirectUriRef.current = redirectUri;
  const silentSsoUriRef = useRef(silentCheckSsoRedirectUri);
  silentSsoUriRef.current = silentCheckSsoRedirectUri;
  const isLoggedOutRef = useRef(false);
  const [authState, setAuthState] = useState<AuthContextState>(buildInitialAuthState);

  const redirectToLogin = useCallback(() => {
    const forceLogin = isSessionRevoked();
    isLoggedOutRef.current = false;
    if (!forceLogin) clearSessionRevoked();
    clearCallbackTokens();

    const uri = redirectUriRef.current;
    const loginOptions: LoginOptions = { redirectUri: uri };

    if (forceLogin) {
      loginOptions.prompt = 'login';
      loginOptions.maxAge = 0;
    }

    return waitForKeycloakReady(client, uri, silentSsoUriRef.current)
      .then(() => client.login(loginOptions));
  }, [client]);

  const logout = useCallback(() => {
    isLoggedOutRef.current = true;
    setAuthState({
      token: null,
      isAuthenticated: false,
      isAwait: false,
    });

    const uri = redirectUriRef.current;
    return logoutSession(uri)
      .then(() => redirectToLogin());
  }, [redirectToLogin]);

  const changePassword = useCallback(() => {
    const uri = redirectUriRef.current;
    return changePasswordSession(uri, silentSsoUriRef.current);
  }, []);

  useEffect(() => {
    const applyAuthStateFromClient = (): void => {
      if (isLoggedOutRef.current) return;

      const isActive = resolveAuthenticated(client);
      if (isActive) {
        clearSessionRevoked();
        isLoggedOutRef.current = false;
        persistSessionToken(client);
      }

      setAuthState({
        isAuthenticated: isActive,
        isAwait: false,
        token: isActive ? client.token : null,
      });
    };

    setAuthSuccessListener(applyAuthStateFromClient);

    if (isLoggedOutRef.current) {
      return () => setAuthSuccessListener(null);
    }

    const hadCallback = isOAuthCallbackUrl();
    if (hadCallback) clearSessionRevoked();
    if (!hadCallback) clearCallbackTokens();
    const uri = redirectUriRef.current;
    client.redirectUri = uri;

    initKeycloakSession(client, uri, silentSsoUriRef.current)
      .then(() => {
        finishOAuthCallback(hadCallback, false);
        applyAuthStateFromClient();
      })
      .catch(() => {
        finishOAuthCallback(hadCallback, true);
        setAuthState({
          isAuthenticated: false,
          isAwait: false,
          token: null,
        });
      });

    return () => setAuthSuccessListener(null);
  }, [client]);

  const actions = useMemo(
    (): AuthContextAction => ({ redirectToLogin, logout, changePassword }),
    [redirectToLogin, logout, changePassword],
  );

  const value = useMemo(
    (): AuthContextType => [authState, actions],
    [authState, actions],
  );

  const { Provider } = AuthContext;
  return (<Provider value={value}>{children}</Provider>);
}

export default function useAuth(): [AuthContextState, AuthContextAction] {
  const context = useContext(AuthContext);
  return context;
}
