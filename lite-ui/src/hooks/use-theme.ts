import { useState, useEffect } from 'react';

const THEME_KEY = 'ui-theme';
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

/* eslint-disable-next-line no-unused-vars */
type Theme = [string, (mode: string) => void];

const themeMode = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto',
};

const preferDarkTheme = (): boolean => mediaQuery.matches;

const getTheme = () => {
  const curTheme = window.localStorage.getItem(THEME_KEY);
  if (curTheme) return curTheme;
  return themeMode.AUTO;
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

export default function useTheme(): Theme {
  const theme = getTheme();
  const [mode, setMode] = useState<string>(theme);

  const setThemeMode = (nMode: string) => {
    setMode(() => {
      applyTheme(nMode);
      return nMode;
    });
  };

  useEffect(() => {
    applyTheme(mode);
    const changeHandler = () => {
      const curMode = getTheme();
      if (curMode !== themeMode.AUTO) return;
      document.documentElement.setAttribute(
        'data-theme',
        resolvePageTheme(themeMode.AUTO),
      );
    };

    mediaQuery.addEventListener('change', changeHandler);
    return () => mediaQuery.removeEventListener('change', changeHandler);
  }, []);

  return [mode, setThemeMode];
}
