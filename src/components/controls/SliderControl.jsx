import { useState, useRef } from 'react';
import { tokens as t } from '../../styles/tokens';

export default function SliderControl({
    label,
    min,
    max,
    step,
    value,
    onChange,
}) {
    const [hovered, setHovered] = useState(false);
    const [inputValue, setInputValue] = useState(parseFloat(value).toFixed(2));
    const isEditing = useRef(false);

    function handleInputChange(raw) {
        setInputValue(raw);
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed >= min && parsed <= max) {
            onChange(parsed);
        }
    }

    function handleInputBlur() {
        isEditing.current = false;
        const parsed = parseFloat(inputValue);
        if (isNaN(parsed) || parsed < min || parsed > max) {
            setInputValue(parseFloat(value).toFixed(2));
        } else {
            setInputValue(parsed.toFixed(2));
        }
    }

    function handleSliderChange(e) {
        const v = parseFloat(e.target.value);
        onChange(v);
        if (!isEditing.current) {
            setInputValue(v.toFixed(2));
        }
    }

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 40px 80px',
                alignItems: 'center',
                gap: t.space[2],
                // marginBottom: t.space[2],
                height: '36px',
            }}
        >
            {/* Label */}
            <span
                style={{
                    fontSize: t.fontSize.base,
                    fontFamily: t.font.sans,
                    fontWeight: t.fontWeight.normal,
                    color: t.color.textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                }}
            >
                {label}
            </span>

            {/* Editable value — only visible on hover */}
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={inputValue}
                onChange={e => handleInputChange(e.target.value)}
                onFocus={() => { isEditing.current = true; }}
                onBlur={handleInputBlur}
                style={{
                    width: '100%',
                    background: hovered ? t.color.overlayHover : 'transparent',
                    border: `1px solid ${hovered ? t.color.border : 'transparent'}`,
                    borderRadius: t.radius.sm,
                    outline: 'none',
                    color: hovered ? t.color.text : 'transparent',
                    fontFamily: t.font.sans,
                    fontSize: t.fontSize.base,
                    fontWeight: t.fontWeight.normal,
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'center',
                    padding: `2px ${t.space[1]}`,
                    transition: 'all 0.15s ease',
                    cursor: hovered ? 'text' : 'default',
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                }}
            />

            {/* Slider */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleSliderChange}
                style={{
                    width: '100%',
                    cursor: 'pointer',
                    accentColor: t.color.accent,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    borderRadius: '999px',
                    background: `linear-gradient(to right, ${t.color.textMuted} 0%, ${t.color.textMuted} ${((value - min) / (max - min)) * 100}%, ${t.color.sliderTrack} ${((value - min) / (max - min)) * 100}%, ${t.color.sliderTrack} 100%)`,
                }}
            />
        </div>
    );
}