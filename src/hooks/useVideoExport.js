import { useRef, useState } from 'react';
import * as Mp4Muxer from 'mp4-muxer';

const DURATION = 10;
const FPS = 60;
const WIDTH = 1280;
const HEIGHT = 720;
const TOTAL = DURATION * FPS;

function hexToVec3(hex) {
    return [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
    ];
}

function setColors(gl, prog, uniformName, hexColors) {
    if (!hexColors || !hexColors.length) return;
    const padded = [...hexColors];
    while (padded.length < 8) padded.push('#000000');
    const flat = padded.flatMap(hexToVec3);
    const loc = gl.getUniformLocation(prog, uniformName);
    if (loc) gl.uniform3fv(loc, flat);
    const countLoc = gl.getUniformLocation(prog, 'uColorCount');
    if (countLoc) gl.uniform1i(countLoc, hexColors.length);
}

// Mirrors buildGradientTexture() in FlowingCanvas.
function buildGradientTexture(gl, hexColors) {
    const TEX_WIDTH = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = TEX_WIDTH;
    offscreen.height = 1;
    const ctx = offscreen.getContext('2d');

    const grd = ctx.createLinearGradient(0, 0, TEX_WIDTH, 0);
    hexColors.forEach((hex, i) => {
        const [r, g, b] = hexToVec3(hex);
        grd.addColorStop(
            i / Math.max(hexColors.length - 1, 1),
            `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`
        );
    });
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, TEX_WIDTH, 1);

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

function buildGL(buildShader) {
    const glCanvas = document.createElement('canvas');
    glCanvas.width = WIDTH;
    glCanvas.height = HEIGHT;
    const gl = glCanvas.getContext('webgl', { preserveDrawingBuffer: true }) ||
        glCanvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
    if (!gl) return null;

    const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0,1); }`;
    function mkShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
            console.error('Shader error:', gl.getShaderInfoLog(s));
        return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, buildShader()));
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const canvas2d = document.createElement('canvas');
    canvas2d.width = WIDTH;
    canvas2d.height = HEIGHT;
    const ctx2d = canvas2d.getContext('2d', { willReadFrequently: true, desynchronized: true });

    return { gl, buf, prog, glCanvas, canvas2d, ctx2d };
}

// FIX 1: `p` is already the active-gradient param slice — App.jsx passes
// params[activeGradient], so we use it directly without re-indexing.
function makeSetUniforms(activeGradient, p) {
    if (activeGradient === 'aurora') {
        return function (gl, prog, time) {
            gl.uniform2f(gl.getUniformLocation(prog, 'R'), WIDTH, HEIGHT);
            gl.uniform1f(gl.getUniformLocation(prog, 'T'), time);
            gl.uniform1f(gl.getUniformLocation(prog, 'uBlobSize'), p.blobSize);
            gl.uniform1f(gl.getUniformLocation(prog, 'uPalSpeed'), p.palSpeed);
            setColors(gl, prog, 'uColors', p.colors);
        };
    }

    if (activeGradient === 'mercury') {
        return function (gl, prog, time) {
            gl.uniform2f(gl.getUniformLocation(prog, 'R'), WIDTH, HEIGHT);
            gl.uniform1f(gl.getUniformLocation(prog, 'T'), time);
            gl.uniform1f(gl.getUniformLocation(prog, 'uFlow'), p.flow ?? 0.4);
            gl.uniform1f(gl.getUniformLocation(prog, 'uScale'), p.scale ?? 1.2);
            gl.uniform1f(gl.getUniformLocation(prog, 'uSheen'), p.sheen ?? 0.5);
            gl.uniform1f(gl.getUniformLocation(prog, 'uNoise'), p.noise ?? 0.06);
            setColors(gl, prog, 'uColors', p.colors);
        };
    }

    // FIX 2: App.jsx uses the key 'wave' (not 'flowing') for the wave/flowing gradient.
    if (activeGradient === 'wave') {
        let gradTex = null;
        return function (gl, prog, time) {
            if (!gradTex) {
                const colors = p.colors?.length ? p.colors : ['#000000', '#ffffff'];
                gradTex = buildGradientTexture(gl, colors);
            }
            gl.uniform2f(gl.getUniformLocation(prog, 'R'), WIDTH, HEIGHT);
            gl.uniform1f(gl.getUniformLocation(prog, 'T'), time);
            gl.uniform1f(gl.getUniformLocation(prog, 'uWaveAmp'), p.waveAmp ?? 1.0);
            gl.uniform1f(gl.getUniformLocation(prog, 'uWaveSpeed'), p.waveSpeed ?? 1.0);
            gl.uniform1f(gl.getUniformLocation(prog, 'uBlurAmt'), p.blurAmt ?? 0.5);
            gl.uniform1f(gl.getUniformLocation(prog, 'uScale'), p.scale ?? 1.0);
            setColors(gl, prog, 'uColors', p.colors ?? ['#000000']);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, gradTex);
            gl.uniform1i(gl.getUniformLocation(prog, 'uGradientTex'), 1);
        };
    }

    // plasma (default)
    return function (gl, prog, time) {
        gl.uniform2f(gl.getUniformLocation(prog, 'R'), WIDTH, HEIGHT);
        gl.uniform1f(gl.getUniformLocation(prog, 'T'), time);
        gl.uniform1f(gl.getUniformLocation(prog, 'uDensity'), p.density ?? 1.0);
        gl.uniform1f(gl.getUniformLocation(prog, 'uWarp'), p.warp ?? 0.5);
        setColors(gl, prog, 'uColors', p.colors);
    };
}

function drawGL(gl, buf, prog, setUniforms, time) {
    gl.viewport(0, 0, WIDTH, HEIGHT);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    setUniforms(gl, prog, time);
    const err = gl.getError();
    if (err !== gl.NO_ERROR) console.error('GL error before draw:', err);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export function useVideoExport({ activeGradient, params, buildShader }) {
    const [progress, setProgress] = useState(null);
    const abortRef = useRef(false);

    async function exportVideo() {
        abortRef.current = false;
        setProgress(0);
        await new Promise(r => setTimeout(r, 50));

        const ctx = buildGL(buildShader);
        if (!ctx) { console.error('WebGL not available'); setProgress(null); return; }
        const { gl, buf, prog, glCanvas, canvas2d, ctx2d } = ctx;

        // `params` is already the active-gradient slice from App.jsx
        const setUniforms = makeSetUniforms(activeGradient, params);

        console.log('Export params:', JSON.stringify(params));
        console.log('Active gradient:', activeGradient);
        console.log('buildShader result length:', buildShader().length);

        if (typeof VideoEncoder === 'undefined') {
            await exportWebM(gl, buf, prog, glCanvas, canvas2d, ctx2d, setUniforms);
            setProgress(null);
            return;
        }

        try {
            const muxer = new Mp4Muxer.Muxer({
                target: new Mp4Muxer.ArrayBufferTarget(),
                video: { codec: 'avc', width: WIDTH, height: HEIGHT },
                fastStart: 'in-memory',
            });

            const encoder = new VideoEncoder({
                output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                error: e => console.error('VideoEncoder error:', e),
            });

            encoder.configure({
                codec: 'avc1.42001f',
                width: WIDTH,
                height: HEIGHT,
                bitrate: 8_000_000,
                bitrateMode: 'constant',
                framerate: FPS,
            });

            for (let i = 0; i < TOTAL; i++) {
                if (abortRef.current) break;

                const time = i / FPS;
                drawGL(gl, buf, prog, setUniforms, time);
                ctx2d.drawImage(glCanvas, 0, 0);

                const frame = new VideoFrame(canvas2d, {
                    timestamp: Math.round(time * 1_000_000),
                    duration: Math.round(1_000_000 / FPS),
                });
                encoder.encode(frame, { keyFrame: i % 60 === 0 });
                frame.close();

                while (encoder.encodeQueueSize > 15) {
                    await new Promise(r => setTimeout(r, 5));
                }

                if (i % 5 === 0) {
                    setProgress(Math.round((i / TOTAL) * 100));
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            setProgress(99);
            await encoder.flush();
            muxer.finalize();

            const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
            download(blob, 'mp4');

        } catch (err) {
            console.error('MP4 failed, falling back to WebM:', err);
            await exportWebM(gl, buf, prog, glCanvas, canvas2d, ctx2d, setUniforms);
        }

        setProgress(null);
    }

    async function exportWebM(gl, buf, prog, glCanvas, canvas2d, ctx2d, setUniforms) {
        const stream = canvas2d.captureStream(FPS);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
        const chunks = [];
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.start(100);

        const startMs = performance.now();
        const durationMs = DURATION * 1000;

        await new Promise(resolve => {
            recorder.onstop = resolve;
            function tick() {
                if (abortRef.current) { recorder.stop(); return; }
                const elapsed = performance.now() - startMs;
                if (elapsed >= durationMs) { recorder.stop(); return; }
                drawGL(gl, buf, prog, setUniforms, elapsed / 1000);
                ctx2d.drawImage(glCanvas, 0, 0);
                setProgress(Math.round((elapsed / durationMs) * 100));
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });

        const blob = new Blob(chunks, { type: 'video/webm' });
        download(blob, 'webm');
    }

    function download(blob, ext) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gradient-studio-${activeGradient}-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return { exportVideo, progress };
}