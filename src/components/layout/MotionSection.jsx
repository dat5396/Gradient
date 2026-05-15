import {
    PlayIcon,
    PauseIcon,
} from '@heroicons/react/24/outline';

import SectionTitle from './SectionTitle';
import PanelSection from './PanelSection';

import SliderControl from '../controls/SliderControl';

import { tokens as t } from '../../styles/tokens';

function PlayPauseButton({
    paused,
    onChange,
}) {
    const Icon = paused
        ? PlayIcon
        : PauseIcon;

    return (
        <button
            onClick={() => onChange(!paused)}
            title={paused ? 'Play' : 'Pause'}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                minWidth: '80px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.color =
                    t.color.text;

                e.currentTarget.style.borderColor =
                    t.color.borderHover;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.color =
                    t.color.textMuted;

                e.currentTarget.style.borderColor =
                    t.color.border;
            }}
        >
            <Icon
                style={{
                    width: '14px',
                    height: '14px',
                }}
            />

            <span>
                {paused ? 'Play' : 'Pause'}
            </span>
        </button>
    );
}

export default function MotionSection({
    speed,
    paused,
    onSpeedChange,
    onPauseChange,
}) {
    return (
        <PanelSection>
            <SectionTitle
                action={
                    <PlayPauseButton
                        paused={paused}
                        onChange={onPauseChange}
                    />
                }
            >
                Motion
            </SectionTitle>

            <SliderControl
                label="Speed"
                min={0}
                max={2}
                step={0.05}
                value={parseFloat(speed).toFixed(2)}
                onChange={onSpeedChange}
            />
        </PanelSection>
    );
}