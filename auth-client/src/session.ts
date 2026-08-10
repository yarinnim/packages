const SESSION_REVOKED_KEY = 'auth_client_session_revoked';

const getSessionStorage = (): Storage | null => {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage;
};

export const isSessionRevoked = (): boolean =>
  getSessionStorage()?.getItem(SESSION_REVOKED_KEY) === '1';

export const revokeSession = (): void =>
  getSessionStorage()?.setItem(SESSION_REVOKED_KEY, '1');

export const clearSession = (): void =>
  getSessionStorage()?.removeItem(SESSION_REVOKED_KEY);
