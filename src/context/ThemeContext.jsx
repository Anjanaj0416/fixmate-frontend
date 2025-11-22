import React, { createContext, useState, useEffect, useCallback } from 'react';
import { THEMES, STORAGE_KEYS } from '../utils/constants';
import { getFromStorage, setToStorage } from '../utils/helpers';

// Create Context
export const ThemeContext = createContext();

/**
 * Theme Provider Component
 * Manages application theme (light/dark/system)
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  const [resolvedTheme, setResolvedTheme] = useState(THEMES.LIGHT);

  /**
   * Initialize theme from storage or system preference
   */
  useEffect(() => {
    const savedTheme = getFromStorage(STORAGE_KEYS.THEME, THEMES.SYSTEM);
    setTheme(savedTheme);
  }, []);

  /**
   * Watch for system theme changes
   */
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) {
      return;
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setResolvedTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    // Set initial value
    setResolvedTheme(darkModeQuery.matches ? THEMES.DARK : THEMES.LIGHT);

    // Listen for changes
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, [theme]);

  /**
   * Apply theme to document
   */
  useEffect(() => {
    const activeTheme = theme === THEMES.SYSTEM ? resolvedTheme : theme;
    
    // Update document class
    const root = window.document.documentElement;
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    root.classList.add(activeTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        activeTheme === THEMES.DARK ? '#1F2937' : '#FFFFFF'
      );
    }
  }, [theme, resolvedTheme]);

  /**
   * Change theme
   */
  const changeTheme = useCallback((newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error('Invalid theme:', newTheme);
      return;
    }

    setTheme(newTheme);
    setToStorage(STORAGE_KEYS.THEME, newTheme);

    // If not system, set resolved theme immediately
    if (newTheme !== THEMES.SYSTEM) {
      setResolvedTheme(newTheme);
    }
  }, []);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = useCallback(() => {
    const currentResolvedTheme = theme === THEMES.SYSTEM ? resolvedTheme : theme;
    const newTheme = currentResolvedTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    changeTheme(newTheme);
  }, [theme, resolvedTheme, changeTheme]);

  /**
   * Set light theme
   */
  const setLightTheme = useCallback(() => {
    changeTheme(THEMES.LIGHT);
  }, [changeTheme]);

  /**
   * Set dark theme
   */
  const setDarkTheme = useCallback(() => {
    changeTheme(THEMES.DARK);
  }, [changeTheme]);

  /**
   * Set system theme
   */
  const setSystemTheme = useCallback(() => {
    changeTheme(THEMES.SYSTEM);
  }, [changeTheme]);

  /**
   * Check if current theme is dark
   */
  const isDark = useCallback(() => {
    const activeTheme = theme === THEMES.SYSTEM ? resolvedTheme : theme;
    return activeTheme === THEMES.DARK;
  }, [theme, resolvedTheme]);

  /**
   * Check if current theme is light
   */
  const isLight = useCallback(() => {
    const activeTheme = theme === THEMES.SYSTEM ? resolvedTheme : theme;
    return activeTheme === THEMES.LIGHT;
  }, [theme, resolvedTheme]);

  /**
   * Check if using system theme
   */
  const isSystem = useCallback(() => {
    return theme === THEMES.SYSTEM;
  }, [theme]);

  /**
   * Get active theme (resolved)
   */
  const getActiveTheme = useCallback(() => {
    return theme === THEMES.SYSTEM ? resolvedTheme : theme;
  }, [theme, resolvedTheme]);

  const value = {
    theme,
    resolvedTheme,
    activeTheme: getActiveTheme(),
    changeTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isDark,
    isLight,
    isSystem,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;