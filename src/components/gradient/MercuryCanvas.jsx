import { useRef, useEffect } from 'react';
import { useWebGL } from '../../hooks/useWebGL';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { buildMercuryShader } from '../../shaders/mercuryShader';

/**
 * MercuryCanvas
 *
 * Props mirror AuroraCanvas / FlowingCanvas exactly so PreviewArea
 * and useGradientState can treat all three identically.
 *
 * params shape (mercury slice):
 *   colors    string[]   hex colour array (2–8)
 *   flow      number     warp evolution speed  (0.1 – 1.0)
 *   scale     number     spatial zoom          (0.5 – 3.0)
 *   sheen     number     specular highlight    (0.0 – 1.0)
 *   noise     number     grain overlay         (0.0 – 0.3)
 */
export default function MercuryCanvas({ params, speed, paused, canvasSize }) {
    const canvasRef = useRef(null);
    const { compileProgram, drawFrame, setColors } = useWebGL(canvasRef);
    const { getTime } = useAnimationFrame({ paused, speed });
    const progRef = useRef(null);
    const rafRef = useRef(null);

    // Compile shader once on mount
    useEffect(() => {
        progRef.current = compileProgram(buildMercuryShader());
    }, [compileProgram]);

    // Sync canvas dimensions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvasSize.w;
        canvas.height = canvasSize.h;
    }, [canvasSize]);

    // Render loop — reads latest params every frame (no restarts on param change)
    useEffect(() => {
        function loop() {
            const prog = progRef.current;
            if (prog) {
                drawFrame(prog, (gl) => {
                    const u = (name) => gl.getUniformLocation(prog, name);

                    gl.uniform2f(u('R'),
                        gl.drawingBufferWidth,
                        gl.drawingBufferHeight);

                    gl.uniform1f(u('T'), getTime());
                    gl.uniform1f(u('uFlow'), params.flow);
                    gl.uniform1f(u('uScale'), params.scale);
                    gl.uniform1f(u('uSheen'), params.sheen);
                    gl.uniform1f(u('uNoise'), params.noise);

                    setColors(gl, prog, 'uColors', params.colors);
                });
            }
            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [paused, params, drawFrame, getTime, setColors]);

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
        />
    );
}