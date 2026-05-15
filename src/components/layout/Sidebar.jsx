import MotionSection from './MotionSection';
import PaletteSection from './PaletteSection';
import ParametersSection from './ParametersSection';
import CanvasSizeSection from './CanvasSizeSection';

import { PALETTES } from '../../data/palettes';
import { GRADIENT_META } from '../../data/constants';

import { tokens as t } from '../../styles/tokens';

export default function Sidebar({
    activeGradient,
    params,
    speed,
    paused,
    canvasSize,
    onSpeedChange,
    onPauseChange,
    onParamChange,
    onSizeChange,
    onRandomizePalette,
}) {
    const meta = GRADIENT_META[activeGradient];
    const palettes = PALETTES[activeGradient];
    const p = params[activeGradient];

    function handleColorChange(index, hex) {
        if (index === '__delete__') {
            onParamChange(activeGradient, 'colors', hex);
            return;
        }

        const newColors = [...p.colors];
        newColors[index] = hex;
        onParamChange(activeGradient, 'colors', newColors);
    }

    return (
        <aside
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `1px solid ${t.color.border}`,
                background: t.color.surface,
                fontFamily: t.font.sans,
                overflow: 'hidden',
            }}
        >
            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

                {/* Header */}
                {/* <div
                    style={{
                        padding: `${t.space[4]} ${t.space[6]}`,
                        borderBottom: `1px solid ${t.color.border}`,
                    }}
                >
                    <span
                        style={{
                            fontSize: t.fontSize.md,
                            fontWeight: t.fontWeight.semibold,
                            color: t.color.text,
                            fontFamily: t.font.sans,
                        }}
                    >
                        {meta.label.split('·')[0].trim()}
                    </span>
                </div> */}

                <MotionSection
                    speed={speed}
                    paused={paused}
                    onSpeedChange={onSpeedChange}
                    onPauseChange={onPauseChange}
                />

                <PaletteSection
                    palettes={palettes}
                    paletteIndex={p.paletteIndex}
                    colors={p.colors}
                    onRandomizePalette={onRandomizePalette}
                    onPaletteChange={i => {
                        onParamChange(activeGradient, 'paletteIndex', i);
                        onParamChange(activeGradient, 'colors', palettes[i].colors);
                    }}
                    onColorChange={handleColorChange}
                />

                <ParametersSection
                    activeGradient={activeGradient}
                    params={p}
                    onParamChange={onParamChange}
                />

                <CanvasSizeSection
                    canvasSize={canvasSize}
                    onSizeChange={onSizeChange}
                />

            </div>

            {/* Fixed footer — always visible at the bottom, never scrolled away */}
            <div
                style={{
                    flexShrink: 0,
                    borderTop: `1px solid ${t.color.border}`,
                    padding: `${t.space[3]} ${t.space[6]}`,
                    background: t.color.surface,
                }}
            >
                <div
                    style={{
                        display: 'flex',               // Flex container
                        justifyContent: 'space-between', // Push items to left & right
                        fontSize: t.fontSize.sm,
                        color: t.color.textMuted,
                        fontFamily: t.font.sans,
                    }}
                >
                    <span>Built by Dat Tran</span>
                    <span>2025–2026</span>
                </div>
            </div>
        </aside>
    );
}