import { useState, useEffect } from 'react';

const THEME_KEY = 'ui-theme';
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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

export type ThemeItem = {
  name: string,
  label: string,
};

export type ThemeProps = {
  defaultMode?: string,
  themes?: ThemeItem[],
};

export type Theme = {
  isAwait: boolean,
  mode: string,
  /* eslint-disable-next-line no-unused-vars */
  setMode: (mode: string) => void,
};

const getThemeNames = (themes: ThemeItem[] = []) => {
  if (themes.length === 0) {
    return [themeMode.LIGHT, themeMode.DARK, themeMode.AUTO];
  }
  return themes.map((item) => item.name);
};

const isValidTheme = (mode: string, themes: ThemeItem[] = []): boolean => {
  const names = getThemeNames(themes);
  return names.includes(mode);
};

export default function useTheme(props: ThemeProps = {}): Theme {
  const { themes = [] } = props;
  const theme = getTheme();
  const initialMode = isValidTheme(theme, themes) ? theme : themeMode.AUTO;
  const [mode, setMode] = useState<string>(initialMode);
  const [isAwait, setIsAwait] = useState<boolean>(false);

  const setThemeMode = (nMode: string) => {
    if (isAwait) return false;
    if (!isValidTheme(nMode, themes)) return false;
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

  return {
    isAwait,
    mode,
    setMode: setThemeMode,
  };
}
