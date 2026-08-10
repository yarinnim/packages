import { getClient, waitForKeycloakReady } from './client';

/**
 * Redirects the user to Keycloak to change their password.
 *
 * @example
 * changePassword('https://app.example.com/dashboard', silentCheckSsoUri);
 */
export const changePassword = (
  redirectUri: string,
  silentCheckSsoRedirectUri?: string,
): Promise<void> => {
  const client = getClient();
  if (!client) {
    return Promise.reject(new Error('Auth client is not initialized.'));
  }

  return waitForKeycloakReady(client, redirectUri, silentCheckSsoRedirectUri)
    .then(() => client.login({
      redirectUri,
      action: 'UPDATE_PASSWORD',
    }));
};
