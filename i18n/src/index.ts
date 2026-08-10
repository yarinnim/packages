import { useState, useEffect } from 'react';
import { localeMatches } from './utils';
import { getPhrase, save, getLocale } from './storage';

declare global {
  interface Window { translate: any }
};

const localeEscape = (str: string, obj: Record<string, any> = {}): string => {
  const keys = Object.keys(obj);
  return keys.reduce((carry, placeholder) => {
    const nextResult = carry.replace(`{${placeholder}}`, obj[placeholder]);
    return nextResult;
  }, str);
};

const translateFnc = (phrase: any, key: string, replace: Record<string, any> = {}) => {
  const translation: any = phrase[key.toLowerCase()] || key
    .split('.')
    .reduce((t, i) => t[i.toLowerCase()] || key, phrase);
  const translated = localeEscape(translation || key, replace);
  return translated;
};

export type I18nProps = {
  version: string,
  getUrl: (_languageCode: string) => string | [string, Record<string, any>];
  fetcher: any;
  language?: string;
  storage?: 'ram' | 'local-storage';
};

const keysToLowerCase = (phrase: Record<string, string>) => Object.entries(phrase)
  .reduce((accu: any, [key, value]: string[]) => {
    const touchedKey = key.toLowerCase();
    return {
      ...accu,
      [touchedKey]: value,
    };
  }, {});

const setLanguageFun = (props: any, language: string) => {
  const { version, getUrl, fetcher, setI18n } = props;
  const theUrl = getUrl(language);
  const [url, reqProps] = Array.isArray(theUrl) ? theUrl : [theUrl, {}];
  const requestUrl = `${url}?version=${version}`;

  return fetcher(requestUrl, reqProps)
    .catch(() => ({}))
    .then(keysToLowerCase)
    .then((phrase: any) => {
      save({ version, language }, phrase);
      return {
        locale: { version, language },
        phrase,
      };
    })
    .then((i18n: any) => {
      return setI18n(() => i18n);
    });
};

const loadFromStorage = (setI18n: CallableFunction) => {
  const storedPhrase = getPhrase();
  return setI18n((curI18n: any) => ({
    ...curI18n,
    phrase: storedPhrase,
  }));
};

const getLanguage = () => {
  const { language } = getLocale();
  return language;
};

export default function useI18n(props: I18nProps) {
  const { language = getLanguage(), fetcher, getUrl, version } = props;
  const [i18n, setI18n] = useState({
    locale: { language, version },
    phrase: {},
  });

  const { locale } = i18n;

  const setLangBind = { fetcher, version, getUrl, setI18n };
  const setLanguage = setLanguageFun.bind(null, setLangBind); 

  useEffect(() => {
    const matches = localeMatches(locale);
    if (matches) {
      loadFromStorage(setI18n);
    } else {
      setLanguage(language);
    }
  }, []);

  const translator = translateFnc.bind(null, i18n.phrase);
  window.translate = translator;

  return [translator, locale, setLanguage];
}
