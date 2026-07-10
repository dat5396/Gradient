import { tokens as t } from '../../styles/tokens';
import { useTheme } from './UseTheme';

const IconSun = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="13" height="13">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const IconMoon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="13" height="13">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            style={{
                position: 'relative',
                width: '52px',
                height: '28px',
                borderRadius: t.radius.full,
                background: t.color.overlaySubtle,
                border: `1px solid ${t.color.border}`,
                cursor: 'pointer',
                padding: '2px',
                flexShrink: 0,
            }}>
            {/* Sliding thumb */}
            <div style={{
                position: 'absolute',
                top: '2px',
                left: isLight ? 'calc(100% - 24px - 2px)' : '2px',
                width: '24px',
                height: '22px',
                borderRadius: t.radius.full,
                background: t.color.surface,
                border: `1px solid ${t.color.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: t.color.text,
                transition: 'left 0.2s ease',
            }}>
                {isLight ? <IconSun /> : <IconMoon />}
            </div>
        </button>
    );
}