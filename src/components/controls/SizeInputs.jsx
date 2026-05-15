// SizeInputs.jsx
import { tokens as t } from '../../styles/tokens';

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${t.color.border}`,
    borderRadius: t.radius.md,
    padding: `${t.space[2]} ${t.space[3]}`,
    color: t.color.text,
    fontFamily: t.font.sans,
    fontSize: t.fontSize.base,
    fontWeight: t.fontWeight.medium,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
};

const labelStyle = {
    fontSize: t.fontSize.base,
    fontWeight: t.fontWeight.medium,
    color: t.color.textMuted,
    fontFamily: t.font.sans,
    marginBottom: t.space[1],
    display: 'block',
};

export default function SizeInputs({ canvasSize, onChange }) {
    function handleChange(key, raw) {
        const val = parseInt(raw, 10);
        if (!isNaN(val) && val > 0) {
            onChange({
                ...canvasSize,
                [key]: Math.min(Math.max(val, 100), 4000),
            });
        }
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: t.space[3],
            }}
        >
            <div>
                <label style={labelStyle}>Width</label>
                <input
                    type="number"
                    min={100}
                    max={4000}
                    value={canvasSize.w}
                    onChange={e => handleChange('w', e.target.value)}
                    style={inputStyle}
                    onFocus={e => {
                        e.target.style.borderColor = t.color.borderHover;
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = t.color.border;
                    }}
                />
            </div>

            <div>
                <label style={labelStyle}>Height</label>
                <input
                    type="number"
                    min={100}
                    max={4000}
                    value={canvasSize.h}
                    onChange={e => handleChange('h', e.target.value)}
                    style={inputStyle}
                    onFocus={e => {
                        e.target.style.borderColor = t.color.borderHover;
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = t.color.border;
                    }}
                />
            </div>
        </div>
    );
}