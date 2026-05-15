import { ArrowPathIcon } from '@heroicons/react/24/outline';
import SectionTitle from './SectionTitle';
import PanelSection from './PanelSection';
import PalettePicker from '../controls/PalettePicker';
import { tokens as t } from '../../styles/tokens';

export default function PaletteSection({
    palettes,
    paletteIndex,
    colors,
    onRandomizePalette,
    onPaletteChange,
    onColorChange,
}) {
    return (
        <PanelSection>
            <SectionTitle
                action={
                    <button
                        onClick={onRandomizePalette}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: t.space[1],
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${t.color.border}`,
                            borderRadius: t.radius.md,
                            color: t.color.textMuted,
                            fontFamily: t.font.sans,
                            fontSize: t.fontSize.sm,
                            fontWeight: t.fontWeight.medium,
                            letterSpacing: t.letterSpacing.normal,
                            padding: `${t.space[1]} ${t.space[2]}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '80px',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = t.color.text;
                            e.currentTarget.style.borderColor = t.color.borderHover;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = t.color.textMuted;
                            e.currentTarget.style.borderColor = t.color.border;
                        }}
                    >
                        <ArrowPathIcon style={{ width: '14px', height: '14px' }} />
                        <span>Shuffle</span>
                    </button>
                }
            >
                Colour
            </SectionTitle>

            <PalettePicker
                palettes={palettes}
                activeIndex={paletteIndex}
                activeColors={colors}
                onChange={onPaletteChange}
                onColorChange={onColorChange}
            />
        </PanelSection>
    );
}