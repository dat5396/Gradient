import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gradient-studio-theme';
const EVENT_NAME = 'gradient-studio-theme-change';

function readTheme() {
    if (typeof window === 'undefined') return 'dark';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
}

export function useTheme() {
    const [theme, setThemeState] = useState(readTheme);

    // Keep the DOM attribute + localStorage in sync with this instance's state
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Stay in sync if another component (e.g. ThemeToggle) changes the theme
    useEffect(() => {
        function handleExternalChange(e) {
            setThemeState(e.detail);
        }
        window.addEventListener(EVENT_NAME, handleExternalChange);
        return () => window.removeEventListener(EVENT_NAME, handleExternalChange);
    }, []);

    const setTheme = useCallback((next) => {
        setThemeState(next);
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    return { theme, setTheme, toggleTheme };
}