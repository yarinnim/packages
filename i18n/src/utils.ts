import { getLocale } from './storage';

export const localeMatches = (config: any): boolean => {
  const locale = getLocale();
  const matches = locale.language === config.language && locale.version === config.version;
  return matches;
};
