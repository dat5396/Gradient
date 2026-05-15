import { useRef, useState } from 'react';
import { tokens as t } from '../../styles/tokens';
import ColorPicker from './ColorPicker';

export default function ColorRow({
    color,
    index,
    total,
    onChange,
    onDelete,
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [hovered, setHovered] = useState(false);

    const swatchRef = useRef(null);

    const canDelete = total > 2;

    function handleHexInput(raw) {
        const val = raw.startsWith('#') ? raw : '#' + raw;
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            onChange(val.toUpperCase());
        }
    }

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.space[1],
                marginBottom: t.space[2],
                borderRadius: t.radius.md,
                background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                transition: 'background 0.15s ease',
                position: 'relative',
            }}
        >
            {/* Swatch */}
            <button
                ref={swatchRef}
                onClick={() => setPickerOpen(o => !o)}
                style={{
                    width: '32px',
                    height: '20px',
                    flexShrink: 0,
                    borderRadius: t.radius.sm,
                    background: color,
                    border: `1px solid ${pickerOpen ? t.color.text : t.color.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}
            />

            {/* Input */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    height: '28px',
                    background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: `1px solid ${hovered ? t.color.border : 'transparent'}`,
                    borderRadius: t.radius.md,
                    padding: `0 ${t.space[2]}`,
                    transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
            >
                <input
                    defaultValue={color.slice(1).toUpperCase()}
                    key={color}
                    maxLength={6}
                    onChange={e => handleHexInput(e.target.value)}
                    style={{
                        flex: 1,
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: t.color.text,
                        fontFamily: t.font.sans,
                        fontSize: t.fontSize.base,
                        fontWeight: t.fontWeight.medium,
                        letterSpacing: t.letterSpacing.normal,
                    }}
                />
            </div>

            {/* Delete */}
            <button
                onClick={onDelete}
                disabled={!canDelete}
                title={canDelete ? 'Remove color' : 'Minimum 2 colors'}
                style={{
                    width: '24px',
                    height: '24px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    borderRadius: t.radius.sm,
                    cursor: canDelete ? 'pointer' : 'default',
                    color: hovered ? t.color.textMuted : 'transparent',
                    opacity: hovered ? 1 : 0,
                    transition: 'all 0.15s ease',
                    fontSize: t.fontSize.lg,
                    lineHeight: 1,
                    fontFamily: t.font.sans,
                }}
                onMouseEnter={e => {
                    if (canDelete) e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.color = t.color.textMuted;
                }}
            >
                ×
            </button>

            {/* Picker */}
            {pickerOpen && (
                <ColorPicker
                    color={color}
                    anchorRef={swatchRef}
                    onChange={onChange}
                    onClose={() => setPickerOpen(false)}
                />
            )}
        </div>
    );
}