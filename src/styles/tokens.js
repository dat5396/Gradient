export const tokens = {

    // ─── Typography ───────────────────────────────────────────────────────
    font: {
        sans: 'Montserrat, sans-serif',
    },
    fontSize: {
        xs: '10px',   // labels, badges, section titles
        sm: '13px',  // control labels, values, descriptions
        base: '14px',  // body text
        md: '15px',  // nav items
        lg: '16px',  // logo, headings
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    letterSpacing: {
        tight: '-0.02em',
        normal: '0.04em',
        wide: '0.07em',
        wider: '0.10em',
        widest: '0.12em',
    },
    lineHeight: {
        tight: '1.3',
        normal: '1.6',
        relaxed: '1.8',
    },

    // ─── Colour ───────────────────────────────────────────────────────────
    // These reference CSS custom properties defined in global.css, so
    // every component using these tokens auto-adapts when data-theme flips.
    color: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surface2: 'var(--color-surface2)',

        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        textDim: 'var(--color-text-dim)',
        textOnPrimary: 'var(--color-text-on-primary)',

        border: 'var(--color-border)',
        borderHover: 'var(--color-border-hover)',

        accent: 'var(--color-accent)',
        accentDim: 'var(--color-accent-dim)',

        webgl: 'var(--color-webgl)',
        webglDim: 'var(--color-webgl-dim)',
        canvas2d: 'var(--color-canvas2d)',
        canvas2dDim: 'var(--color-canvas2d-dim)',

        // Overlay / chrome tokens (previously hardcoded rgba() in components)
        overlaySubtle: 'var(--overlay-subtle)',
        overlayHover: 'var(--overlay-hover)',
        overlayHoverText: 'var(--overlay-hover-text)',

        navBg: 'var(--nav-bg)',
        shadowPopover: 'var(--shadow-popover)',
        shadowPreview: 'var(--shadow-preview)',

        previewBg: 'var(--preview-bg)',
        checker: 'var(--checker-color)',

        sliderTrack: 'var(--slider-track)',
    },

    // ─── Spacing ──────────────────────────────────────────────────────────
    space: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
    },

    // ─── Radius ───────────────────────────────────────────────────────────
    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px',
    },

};