import {
  getClient,
  markSessionRevoked,
  resetKeycloakSessionInit,
  type AuthClient,
} from './client';
import { removeToken, clearCallbackTokens } from './token';
import { clearOAuthFromAddressBar, isOAuthCallbackUrl } from './url';

type IFrameProps = {
  url: string;
  resolve: CallableFunction;
};

const clearIFrame = (
  iframe: HTMLIFrameElement,
  resolve: CallableFunction,
  timeout: number = 400,
) => {
  const timer = setTimeout(() => {
    clearTimeout(timer);
    iframe.remove();
    resolve();
  }, timeout);
};

const createIFrame = (props: IFrameProps): HTMLIFrameElement => {
  const { url, resolve } = props;
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.title = 'keycloak-silent-logout';
  iframe.onload = () => clearIFrame(iframe, resolve);
  iframe.src = url;
  return iframe;
};

const silentKeycloakLogout = (
  client: AuthClient,
  redirectUri: string,
): Promise<void> => new Promise((resolve) => {
  try {
    const hasIdToken = Boolean(client.idToken);
    if (!hasIdToken) {
      resolve();
      return;
    }

    const url = client.createLogoutUrl({ redirectUri });
    const iframe = createIFrame({ url, resolve });
    clearIFrame(iframe, resolve, 2500);
    document.body.appendChild(iframe);
  } catch {
    resolve();
  }
});

const clearAuthSession = (): void => {
  removeToken();
  clearCallbackTokens();
};

export const logout = (redirectUri: string): Promise<void> => {
  markSessionRevoked();
  clearAuthSession();
  resetKeycloakSessionInit();

  if (isOAuthCallbackUrl()) clearOAuthFromAddressBar();

  const client = getClient();
  if (!client) return Promise.resolve();

  client.clearToken();
  return silentKeycloakLogout(client, redirectUri);
};
