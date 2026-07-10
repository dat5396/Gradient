import { useRef, useState, useEffect } from 'react';
import { tokens as t } from '../../styles/tokens';
import ColorRow from './ColorRow';

export default function PalettePicker({
    palettes,
    activeIndex,
    activeColors,
    onChange,
    onColorChange,
}) {
    const canAdd = activeColors.length < 8;

    function handleAdd() {
        if (!canAdd) return;
        const last = activeColors[activeColors.length - 1];
        onColorChange(activeColors.length, last);
    }

    function handleDelete(index) {
        if (activeColors.length <= 2) return;
        const next = activeColors.filter((_, i) => i !== index);
        onColorChange('__delete__', next);
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
            }}
        >
            <div>
                {activeColors.map((color, i) => (
                    <ColorRow
                        key={i}
                        index={i}
                        color={color}
                        total={activeColors.length}
                        onChange={hex => onColorChange(i, hex)}
                        onDelete={() => handleDelete(i)}
                    />
                ))}
            </div>

            {canAdd && (
                <button
                    onClick={handleAdd}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: t.space[2],
                        width: '100%',
                        padding: `${t.space[2]} 0`,
                        background: t.color.surface,
                        // border: `1px solid ${t.color.border}`,
                        borderRadius: t.radius.md,
                        cursor: 'pointer',
                        color: t.color.textMuted,
                        fontFamily: t.font.sans,
                        fontSize: t.fontSize.sm,
                        fontWeight: t.fontWeight.medium,
                        transition: 'all 0.2s',
                        height: '32px',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = t.color.borderHover;
                        e.currentTarget.style.color = t.color.text;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = t.color.surface;
                        e.currentTarget.style.borderColor = t.color.border;
                        e.currentTarget.style.color = t.color.textMuted;
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                            d="M5 1v8M1 5h8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                    Add color{activeColors.length < 8 ? ` (${activeColors.length}/8)` : ''}
                </button>
            )}
        </div>
    );
}