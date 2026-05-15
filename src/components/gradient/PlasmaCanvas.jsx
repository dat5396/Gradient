import { useRef, useEffect } from 'react';
import { useWebGL } from '../../hooks/useWebGL';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { buildPlasmaShader } from '../../shaders/plasmaShader';

export default function PlasmaCanvas({ params, speed, paused, canvasSize }) {
    const canvasRef = useRef(null);
    const { compileProgram, drawFrame, setColors } = useWebGL(canvasRef);
    const { getTime } = useAnimationFrame({ paused, speed });
    const progRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        progRef.current = compileProgram(buildPlasmaShader());
    }, [compileProgram]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvasSize.w;
        canvas.height = canvasSize.h;
    }, [canvasSize]);

    useEffect(() => {
        function loop() {
            const prog = progRef.current;
            if (prog) {
                drawFrame(prog, (gl) => {
                    gl.uniform2f(gl.getUniformLocation(prog, 'R'),
                        gl.drawingBufferWidth, gl.drawingBufferHeight);
                    gl.uniform1f(gl.getUniformLocation(prog, 'T'), getTime());
                    gl.uniform1f(gl.getUniformLocation(prog, 'uDensity'), params.density ?? 1.0);
                    gl.uniform1f(gl.getUniformLocation(prog, 'uWarp'), params.warp ?? 0.5);
                    setColors(gl, prog, 'uColors', params.colors);
                });
            }
            if (!paused) rafRef.current = requestAnimationFrame(loop);
        }
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [paused, params, drawFrame, getTime, setColors]);

    return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}