import { useState, useEffect } from 'react';

const themeMode = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto',
};

const THEME_KEY = 'ui-theme';
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const defaultThemes = [themeMode.LIGHT, themeMode.DARK, themeMode.AUTO];
const preferDarkTheme = (): boolean => mediaQuery.matches;

const getTheme = (defaultMode: string) => {
  const curTheme = window.localStorage.getItem(THEME_KEY);
  if (curTheme) return curTheme;
  return defaultMode;
};

const resolvePageTheme = (theme: string): string => {
  const isAuto = theme === themeMode.AUTO;
  if (!isAuto) return theme;
  return preferDarkTheme() ? themeMode.DARK : themeMode.LIGHT;
};

const applyTheme = (theme: string): void => {
  window.localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', resolvePageTheme(theme));
};

export type ThemeProps = {
  defaultMode?: string,
  themes?: string[],
};

export type Theme = {
  isAwait: boolean,
  mode: string,
  /* eslint-disable-next-line no-unused-vars */
  setMode: (mode: string) => void,
};

const getThemeMode = (themes: string[], curMode: string, pMode: string = '') => {
  if (pMode !== '') return pMode;
  const index = themes.indexOf(curMode);
  const isLast = index < 0 || index >= themes.length - 1;
  const nextIndex = isLast ? 0 : index + 1;
  return themes[nextIndex];
};

export default function useTheme(props: ThemeProps = {}): Theme {
  const { themes = defaultThemes, defaultMode = 'auto' } = props;
  const theme = getTheme(defaultMode);
  const [mode, setMode] = useState<string>(theme);
  const [isAwait, setIsAwait] = useState<boolean>(false);

  const setThemeMode = (pMode: string = '') => {
    if (isAwait) return false;
    const nMode = getThemeMode(themes, mode, pMode);

    setIsAwait(true);
    setMode(() => {
      applyTheme(nMode);
      setIsAwait(false);
      return nMode;
    });
  };

  useEffect(() => {
    applyTheme(mode);
    const changeHandler = () => {
      const curMode = getTheme(defaultMode);
      if (curMode !== themeMode.AUTO) return;
      document.documentElement.setAttribute(
        'data-theme',
        resolvePageTheme(themeMode.AUTO),
      );
    };

    mediaQuery.addEventListener('change', changeHandler);
    return () => mediaQuery.removeEventListener('change', changeHandler);
  }, []);

  return {
    isAwait,
    mode,
    setMode: setThemeMode,
  };
}
