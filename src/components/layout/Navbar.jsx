import { useState, useRef, useEffect } from 'react';
import { tokens as t } from '../../styles/tokens';

const TABS = ['mercury', 'wave', 'plasma'];
const TAB_LABELS = { mercury: 'Mercury', wave: 'Wave', plasma: 'Plasma' };
const TAB_PREVIEWS = {
    mercury: '/preview-mercury.webp',
    wave: '/preview-wave.webp',
    plasma: '/preview-plasma.webp',
};

const IconPhoto = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const IconVideo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

// Preload images so hover feels instant
const preloadImages = () => {
    Object.values(TAB_PREVIEWS).forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

function TabButton({ id, active, onSwitch }) {
    const [hovered, setHovered] = useState(false);
    const hoverTimerRef = useRef(null);
    const [showPreview, setShowPreview] = useState(false);

    // Delay showing the popover slightly so fast mouse-throughs don't flash it
    function handleMouseEnter() {
        setHovered(true);
        hoverTimerRef.current = setTimeout(() => setShowPreview(true), 120);
    }

    function handleMouseLeave() {
        setHovered(false);
        clearTimeout(hoverTimerRef.current);
        setShowPreview(false);
    }

    useEffect(() => () => clearTimeout(hoverTimerRef.current), []);

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => onSwitch(id)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'relative',
                    background: active
                        ? 'rgba(255, 255, 255, 0.08)'
                        : hovered
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'none',
                    border: 'none',
                    color: active
                        ? t.color.text
                        : hovered
                            ? 'rgba(255,255,255,0.75)'
                            : t.color.textMuted,
                    fontFamily: t.font.sans,
                    fontSize: t.fontSize.base,
                    fontWeight: t.fontWeight.medium,
                    padding: `${t.space[1]} ${t.space[4]}`,
                    borderRadius: t.radius.full,
                    cursor: 'pointer',
                    transition: 'background 0.18s ease, color 0.18s ease',
                    whiteSpace: 'nowrap',
                    height: '32px',
                    width: '100px',
                }}>
                {TAB_LABELS[id]}
            </button>

            {/* Preview popover */}
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: '50%',
                transform: showPreview
                    ? 'translateX(-50%) translateY(0px)'
                    : 'translateX(-50%) translateY(-6px)',
                opacity: showPreview ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                zIndex: 200,
            }}>
                <div style={{
                    background: t.color.surface,
                    border: `2px solid ${t.color.border}`,
                    borderRadius: t.radius.lg,
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    width: '180px',
                }}>
                    <img
                        src={TAB_PREVIEWS[id]}
                        alt={`${TAB_LABELS[id]} preview`}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                        }}
                    />

                </div>
            </div>
        </div>
    );
}

export default function Navbar({ active, onSwitch, onExport, onExportVideo, exportVideoProgress }) {
    const [open, setOpen] = useState(false);
    const popoverRef = useRef(null);
    const buttonRef = useRef(null);

    const isExporting = exportVideoProgress !== null;

    // Preload preview images on mount
    useEffect(() => { preloadImages(); }, []);

    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (popoverRef.current?.contains(e.target)) return;
            if (buttonRef.current?.contains(e.target)) return;
            setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    function handleImage() {
        setOpen(false);
        onExport();
    }

    function handleVideo() {
        if (isExporting) return;
        setOpen(false);
        onExportVideo();
    }

    function handleSwitch(id) {
        onSwitch(id);
    }

    return (
        <nav style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            height: '66px',
            padding: `0 ${t.space[6]}`,
            borderBottom: `1px solid ${t.color.border}`,
            background: 'rgba(8,8,8,0.95)',
            backdropFilter: 'blur(12px)',
            fontFamily: t.font.sans,
        }}>
            {/* Logo — left column */}
            <div>
                <img src='/gradient-logo.svg' width={108} height={36} />
            </div>

            {/* Tabs — center column */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: t.radius.full,
                padding: `${t.space[1]}`,
            }}>
                {TABS.map(id => (
                    <TabButton
                        key={id}
                        id={id}
                        active={active === id}
                        onSwitch={handleSwitch}
                    />
                ))}
            </div>

            {/* Export button + popover — right column */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        ref={buttonRef}
                        onClick={() => !isExporting && setOpen(o => !o)}
                        style={{
                            height: '32px', padding: `0 ${t.space[3]}`,
                            borderRadius: t.radius.lg,
                            background: t.color.accent,
                            border: 'none',
                            color: t.color.text,
                            fontFamily: t.font.sans,
                            fontSize: t.fontSize.base,
                            fontWeight: t.fontWeight.medium,
                            letterSpacing: t.letterSpacing.normal,
                            cursor: isExporting ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            opacity: isExporting ? 0.7 : 1,
                            minWidth: '80px',
                        }}>
                        {isExporting ? `${exportVideoProgress}%…` : 'Export'}
                    </button>

                    {open && (
                        <div
                            ref={popoverRef}
                            style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                background: t.color.surface,
                                border: `1px solid ${t.color.border}`,
                                borderRadius: t.radius.lg,
                                padding: '4px',
                                minWidth: '120px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                zIndex: 100,
                            }}>
                            <button
                                onClick={handleImage}
                                onMouseEnter={e => e.currentTarget.style.background = t.color.surface2}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                style={menuItemStyle(t)}>
                                <IconPhoto />
                                Image
                            </button>
                            <button
                                onClick={handleVideo}
                                onMouseEnter={e => e.currentTarget.style.background = t.color.surface2}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                style={menuItemStyle(t)}>
                                <IconVideo />
                                Video
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
            `}</style>
        </nav>
    );
}

function menuItemStyle(t) {
    return {
        display: 'flex', alignItems: 'center', gap: t.space[2],
        width: '100%', padding: `${t.space[2]} ${t.space[3]}`,
        background: 'none', border: 'none',
        color: t.color.text,
        fontFamily: t.font.sans,
        fontSize: t.fontSize.sm,
        fontWeight: t.fontWeight.medium,
        letterSpacing: t.letterSpacing.normal,
        borderRadius: t.radius.md,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
    };
}