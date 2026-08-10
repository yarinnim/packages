import { clearCallbackTokens } from './token';

const oauthQueryKeys = ['code', 'state', 'session_state', 'iss'];

const stripOAuthFromUrl = (href: string): string => {
  const url = new URL(href);
  oauthQueryKeys.forEach((name: string) => url.searchParams.delete(name));
  url.hash = '';
  return url.toString();
};

export const isOAuthCallbackUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  const hasQueryCallback = oauthQueryKeys.some(
    (name: string) => params.has(name),
  );
  if (hasQueryCallback) return true;

  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return false;

  const hashParams = new URLSearchParams(hash);
  return hashParams.has('code')
    || hashParams.has('state')
    || hashParams.has('access_token');
};

export const getDefaultRedirectUri = (): string => {
  const { origin, pathname } = window.location;
  return stripOAuthFromUrl(`${origin}${pathname}`);
};

export const getSilentCheckSsoRedirectUri = (redirectUri: string): string => {
  const url = new URL(redirectUri);
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length > 0) segments.pop();
  const basePath = segments.length > 0 ? `/${segments.join('/')}` : '';
  return `${url.origin}${basePath}/silent-check-sso.html`;
};

export const clearOAuthFromAddressBar = (): string => {
  clearCallbackTokens();
  const nextPath = getDefaultRedirectUri().replace(window.location.origin, '');
  window.history.replaceState(window.history.state, '', nextPath);
  return nextPath;
};
