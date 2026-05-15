import { useRef, useEffect, useState, useCallback } from 'react';
import { tokens as t } from '../../styles/tokens';

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToHsv(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s, v };
}

function hsvToHex(h, s, v) {
    h = h / 360;
    const i = Math.floor(h * 6);
    const f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t2 = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
        case 0: r = v; g = t2; b = p; break; case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t2; break; case 3: r = p; g = q; b = v; break;
        case 4: r = t2; g = p; b = v; break; default: r = v; g = p; b = q;
    }
    return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function hueToHex(h) { return hsvToHex(h, 1, 1); }

// ── Gradient canvas (SV picker) ───────────────────────────────────────────────
function SvCanvas({ hue, s, v, onChange }) {
    const canvasRef = useRef(null);
    const dragging = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        // White → hue colour
        const gradH = ctx.createLinearGradient(0, 0, W, 0);
        gradH.addColorStop(0, '#fff');
        gradH.addColorStop(1, hueToHex(hue));
        ctx.fillStyle = gradH;
        ctx.fillRect(0, 0, W, H);
        // Transparent → black
        const gradV = ctx.createLinearGradient(0, 0, 0, H);
        gradV.addColorStop(0, 'rgba(0,0,0,0)');
        gradV.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gradV;
        ctx.fillRect(0, 0, W, H);
    }, [hue]);

    function pick(e) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const cx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
        const cy = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
        onChange(
            Math.max(0, Math.min(1, cx / rect.width)),
            Math.max(0, Math.min(1, 1 - cy / rect.height))
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', borderRadius: t.radius.md, overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                width={220} height={140}
                style={{ display: 'block', width: '100%', height: '140px', cursor: 'crosshair' }}
                onMouseDown={e => { dragging.current = true; pick(e); }}
                onMouseMove={e => { if (dragging.current) pick(e); }}
                onMouseUp={() => { dragging.current = false; }}
                onMouseLeave={() => { dragging.current = false; }}
            />
            {/* Cursor */}
            <div style={{
                position: 'absolute',
                left: `${s * 100}%`, top: `${(1 - v) * 100}%`,
                transform: 'translate(-50%,-50%)',
                width: '12px', height: '12px', borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                pointerEvents: 'none',
            }} />
        </div>
    );
}

// ── Hue bar ───────────────────────────────────────────────────────────────────
function HueBar({ hue, onChange }) {
    const barRef = useRef(null);
    const dragging = useRef(false);

    function pick(e) {
        const rect = barRef.current.getBoundingClientRect();
        const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
        onChange(Math.max(0, Math.min(360, (x / rect.width) * 360)));
    }

    return (
        <div style={{ position: 'relative', height: '12px', borderRadius: t.radius.sm, overflow: 'hidden', cursor: 'pointer' }}>
            <div
                ref={barRef}
                style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
                }}
                onMouseDown={e => { dragging.current = true; pick(e); }}
                onMouseMove={e => { if (dragging.current) pick(e); }}
                onMouseUp={() => { dragging.current = false; }}
                onMouseLeave={() => { dragging.current = false; }}
            />
            {/* Thumb */}
            <div style={{
                position: 'absolute', top: '50%', left: `${(hue / 360) * 100}%`,
                transform: 'translate(-50%,-50%)',
                width: '14px', height: '14px', borderRadius: '50%',
                border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                background: hueToHex(hue), pointerEvents: 'none',
            }} />
        </div>
    );
}

// ── Main ColorPicker popover ──────────────────────────────────────────────────
export default function ColorPicker({ color, onChange, onClose, anchorRef }) {
    const [hsv, setHsv] = useState(() => hexToHsv(color));
    const [hexInput, setHexInput] = useState(color);
    const popoverRef = useRef(null);

    // Sync hex input when hsv changes
    useEffect(() => {
        const hex = hsvToHex(hsv.h, hsv.s, hsv.v);
        setHexInput(hex);
        onChange(hex);
    }, [hsv]);

    // Position popover below anchor
    const [pos, setPos] = useState({ top: 0, left: 0 });
    useEffect(() => {
        if (!anchorRef?.current) return;
        const r = anchorRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + 6, left: r.left });
    }, [anchorRef]);

    // Close on outside click
    useEffect(() => {
        function handle(e) {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target) &&
                anchorRef?.current && !anchorRef.current.contains(e.target)
            ) onClose();
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [onClose]);

    function handleHexInput(val) {
        setHexInput(val);
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            setHsv(hexToHsv(val));
        }
    }

    const hex = hsvToHex(hsv.h, hsv.s, hsv.v);

    return (
        <div
            ref={popoverRef}
            style={{
                position: 'fixed',
                top: pos.top, left: pos.left,
                width: '240px',
                background: '#1a1a22',
                border: `1px solid ${t.color.border}`,
                borderRadius: t.radius.lg,
                padding: t.space[3],
                zIndex: 1000,
                boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                display: 'flex', flexDirection: 'column', gap: t.space[3],
            }}
        >
            {/* SV canvas */}
            <SvCanvas
                hue={hsv.h} s={hsv.s} v={hsv.v}
                onChange={(s, v) => setHsv(prev => ({ ...prev, s, v }))}
            />

            {/* Hue bar */}
            <HueBar
                hue={hsv.h}
                onChange={h => setHsv(prev => ({ ...prev, h }))}
            />

            {/* Hex input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
                <div style={{
                    width: '28px', height: '28px', borderRadius: t.radius.sm,
                    background: hex, flexShrink: 0,
                    border: `1px solid ${t.color.border}`,
                }} />
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${t.color.border}`,
                    borderRadius: t.radius.md, padding: '4px 8px',
                }}>
                    <span style={{ fontSize: t.fontSize.xs, color: t.color.textMuted, fontFamily: t.font.sans }}>HEX</span>
                    <input
                        value={hexInput}
                        onChange={e => handleHexInput(e.target.value)}
                        style={{
                            flex: 1, background: 'none', border: 'none', outline: 'none',
                            color: t.color.text, fontFamily: t.font.sans,
                            fontSize: t.fontSize.base, fontWeight: t.fontWeight.medium,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}