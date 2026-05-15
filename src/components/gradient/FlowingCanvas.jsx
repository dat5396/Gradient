import { useRef, useEffect, useCallback } from 'react';
import { useWebGL } from '../../hooks/useWebGL';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { buildFlowingShader } from '../../shaders/flowingShader';

// ─── Build a 256×1 gradient texture from an array of hex color strings ────────
// Mirrors the setColors() convention in useWebGL — hex strings, padded to 8.
function hexToRgb(hex) {
    return [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
    ];
}

function buildGradientTexture(gl, hexColors) {
    const WIDTH = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = WIDTH;
    offscreen.height = 1;
    const ctx = offscreen.getContext('2d');

    const grd = ctx.createLinearGradient(0, 0, WIDTH, 0);
    hexColors.forEach((hex, i) => {
        const [r, g, b] = hexToRgb(hex);
        grd.addColorStop(
            i / Math.max(hexColors.length - 1, 1),
            `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`
        );
    });
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, WIDTH, 1);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Props
//   params     — { colors: string[], waveAmp: number, waveSpeed: number, blurAmt: number }
//   speed      — playback speed multiplier (passed straight to useAnimationFrame)
//   paused     — boolean
//   canvasSize — { w: number, h: number }
export default function FlowingCanvas({ params, speed, paused, canvasSize }) {
    const canvasRef = useRef(null);
    const { compileProgram, drawFrame, setColors } = useWebGL(canvasRef);
    const { getTime } = useAnimationFrame({ paused, speed });

    const progRef = useRef(null);
    const rafRef = useRef(null);
    const gradTexRef = useRef(null);  // gradient texture handle
    const glRef = useRef(null);  // local gl reference for texture cleanup

    // ── Compile once on mount ────────────────────────────────────────────────
    useEffect(() => {
        progRef.current = compileProgram(buildFlowingShader());
    }, [compileProgram]);

    // ── Resize ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvasSize.w;
        canvas.height = canvasSize.h;
    }, [canvasSize]);

    // ── Rebuild gradient texture whenever colors change ───────────────────────
    // Kept separate from the render loop so the texture isn't rebuilt every frame.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;
        glRef.current = gl;

        // Clean up previous texture
        if (gradTexRef.current) gl.deleteTexture(gradTexRef.current);

        const colors = params.colors?.length ? params.colors : ['#000000', '#ffffff'];
        gradTexRef.current = buildGradientTexture(gl, colors);
    }, [params.colors]);

    // ── Cleanup texture on unmount ────────────────────────────────────────────
    useEffect(() => {
        return () => {
            const gl = glRef.current;
            if (gl && gradTexRef.current) gl.deleteTexture(gradTexRef.current);
        };
    }, []);

    // ── Render loop ───────────────────────────────────────────────────────────
    useEffect(() => {
        function loop() {
            const prog = progRef.current;
            const gradTex = gradTexRef.current;
            if (prog && gradTex) {
                drawFrame(prog, (gl) => {
                    // Resolution
                    gl.uniform2f(
                        gl.getUniformLocation(prog, 'R'),
                        gl.drawingBufferWidth,
                        gl.drawingBufferHeight
                    );
                    // Time
                    gl.uniform1f(gl.getUniformLocation(prog, 'T'), getTime());

                    // Flowing-specific params
                    gl.uniform1f(
                        gl.getUniformLocation(prog, 'uWaveAmp'),
                        params.waveAmp ?? 1.0
                    );
                    gl.uniform1f(
                        gl.getUniformLocation(prog, 'uWaveSpeed'),
                        params.waveSpeed ?? 1.0
                    );
                    gl.uniform1f(
                        gl.getUniformLocation(prog, 'uBlurAmt'),
                        params.blurAmt ?? 345.0
                    );
                    gl.uniform1f(
                        gl.getUniformLocation(prog, 'uScale'),
                        params.scale ?? 1.0
                    );

                    // Colors — kept for uColors/uColorCount parity with other shaders
                    setColors(gl, prog, 'uColors', params.colors ?? ['#000000']);

                    // Gradient texture — bound to texture unit 1 to avoid
                    // conflicting with any unit-0 usage in useWebGL internals
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, gradTex);
                    gl.uniform1i(gl.getUniformLocation(prog, 'uGradientTex'), 1);
                });
            }
            if (!paused) rafRef.current = requestAnimationFrame(loop);
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