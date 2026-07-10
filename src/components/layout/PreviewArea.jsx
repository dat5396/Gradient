import { useRef } from 'react';
import AuroraCanvas from '../gradient/AuroraCanvas';
import PlasmaCanvas from '../gradient/PlasmaCanvas';
import FlowingCanvas from '../gradient/FlowingCanvas';
import MercuryCanvas from '../gradient/MercuryCanvas';
import { tokens as t } from '../../styles/tokens';

export default function PreviewArea({
    activeGradient, params, speed, paused, canvasSize, exportRef, onPauseChange,
}) {
    const { w, h } = canvasSize;

    const canvases = {
        wave: <FlowingCanvas params={params.wave} speed={speed} paused={paused} canvasSize={canvasSize} />,
        aurora: <AuroraCanvas params={params.aurora} speed={speed} paused={paused} canvasSize={canvasSize} />,
        plasma: <PlasmaCanvas params={params.plasma} speed={speed} paused={paused} canvasSize={canvasSize} />,
        mercury: <MercuryCanvas params={params.mercury} speed={speed} paused={paused} canvasSize={canvasSize} />,
    };

    return (
        <div style={{
            position: 'relative', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', background: t.color.previewBg, width: '100%', height: '100%',
        }}>

            {/* Checker background */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.2,
                backgroundImage: `
          linear-gradient(45deg, ${t.color.checker} 25%, transparent 25%),
          linear-gradient(-45deg, ${t.color.checker} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${t.color.checker} 75%),
          linear-gradient(-45deg, transparent 75%, ${t.color.checker} 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
            }} />

            {/* Canvas wrapper */}
            <div
                ref={exportRef}
                onClick={() => onPauseChange(!paused)}
                style={{
                    position: 'relative',
                    aspectRatio: `${w} / ${h}`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    outline: `1px solid ${t.color.border}`,
                    boxShadow: `0 25px 60px ${t.color.shadowPreview}`,
                    cursor: paused ? 'pointer' : 'default',  // optional UX hint
                }}
            >
                {canvases[activeGradient]}

                {/* Bottom-left label */}
                <span style={{
                    position: 'absolute', bottom: t.space[4], left: t.space[4],
                    fontSize: t.fontSize.xs,
                    letterSpacing: t.letterSpacing.widest,
                    textTransform: 'uppercase',
                    color: t.color.textDim,
                    fontFamily: t.font.sans,
                    pointerEvents: 'none',
                }}>
                    {activeGradient}
                </span>

                {/* Top-right size badge */}
                {/* <span style={{
                    position: 'absolute', top: t.space[4], right: t.space[4],
                    fontSize: t.fontSize.xs,
                    letterSpacing: t.letterSpacing.normal,
                    color: t.color.textDim,
                    fontFamily: t.font.sans,
                    background: 'rgba(0,0,0,0.45)',
                    padding: `${t.space[1]} ${t.space[2]}`,
                    borderRadius: t.radius.sm,
                }}>
                    {w} × {h}
                </span> */}
            </div>
        </div>
    );
}