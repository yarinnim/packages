import { LOCALE_PHRASE_KEY, LOCALE_KEY } from './constant';
import type { Locale } from './type';

export const getPhrase = (): Record<string, string> => {
  const phrases = localStorage.getItem(LOCALE_PHRASE_KEY) || '{}';
  try {
    const decodedPhrases = JSON.parse(phrases);
    return decodedPhrases;
  } catch {
    return {};
  }
};

export const savePhrase = (phrase: Record<string, string>) => {
  localStorage.setItem(LOCALE_PHRASE_KEY, JSON.stringify(phrase));
};

const getLangCode = (): string => {
  const [lang] = navigator.language.split('-');
  return lang;
};

export const getLocale = (): Locale => {
  const language = getLangCode();
  try {
    const storedLocale = localStorage.getItem(LOCALE_KEY) || '{}';
    const locale = JSON.parse(storedLocale);
    return {
      language,
      version: '1.0.0',
      ...locale,
    };
  } catch {
    return {
      language,
      version: '1.0.0',
    };
  }
};

export const setLocale = (locale: any) => {
  localStorage.setItem(LOCALE_KEY, JSON.stringify(locale));
};

export const save = (locale: Locale, phrase: Record<string, string>) => {
  setLocale(locale);
  savePhrase(phrase);
};
