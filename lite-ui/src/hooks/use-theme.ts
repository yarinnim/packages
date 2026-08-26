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

const preferDarkTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  const theme = window.localStorage.getItem(THEME_KEY);
  if (theme === themeMode.DARK) return true;
  return mediaQuery.matches;
};

const getTheme = () => {
  const curTheme = window.localStorage.getItem(THEME_KEY);
  if (curTheme) return curTheme;
  return themeMode.AUTO;
};

const applyTheme = (theme: string): void => {
  window.localStorage.setItem(THEME_KEY, theme);
  const isAuto = theme === themeMode.AUTO;
  const pageTheme = isAuto
    ? (preferDarkTheme() ? themeMode.DARK :  themeMode.LIGHT)
    : theme;
  document.documentElement.setAttribute('data-theme', pageTheme);
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
    const changeHandler = (evt: any) => {
      const curMode = getTheme();
      if (curMode !== themeMode.AUTO) return;
      const nextMode = evt.matches ? themeMode.DARK : themeMode.AUTO;
      setThemeMode(nextMode);
    };

    mediaQuery.addEventListener('change', changeHandler);
    return () => mediaQuery.removeEventListener('change', changeHandler); 
  }, []);

  return [mode, setThemeMode];
}
