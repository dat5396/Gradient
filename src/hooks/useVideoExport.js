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

function buildGL(buildShader) {
    // WebGL renders into a regular canvas
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

    // 2D canvas is what VideoFrame will actually read from
    const canvas2d = document.createElement('canvas');
    canvas2d.width = WIDTH;
    canvas2d.height = HEIGHT;
    const ctx2d = canvas2d.getContext('2d', { willReadFrequently: true, desynchronized: true });

    return { gl, buf, prog, glCanvas, canvas2d, ctx2d };
}

function makeSetUniforms(activeGradient, params) {
    return function (gl, prog, time) {
        gl.uniform2f(gl.getUniformLocation(prog, 'R'), WIDTH, HEIGHT);
        gl.uniform1f(gl.getUniformLocation(prog, 'T'), time);
        if (activeGradient === 'aurora') {
            gl.uniform1f(gl.getUniformLocation(prog, 'uBlobSize'), params.blobSize);
            gl.uniform1f(gl.getUniformLocation(prog, 'uPalSpeed'), params.palSpeed);
        } else {
            gl.uniform1f(gl.getUniformLocation(prog, 'uDensity'), params.density);
            gl.uniform1f(gl.getUniformLocation(prog, 'uSat'), params.saturation);
            gl.uniform1f(gl.getUniformLocation(prog, 'uBright'), params.brightness);
        }
        setColors(gl, prog, 'uColors', params.colors);
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
    const px = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    console.log('First pixel after draw:', px[0], px[1], px[2], px[3]);
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

                // 1. Render to WebGL canvas
                drawGL(gl, buf, prog, setUniforms, time);

                // 2. Copy WebGL → 2D canvas via drawImage (browser handles GPU readback)
                ctx2d.drawImage(glCanvas, 0, 0);

                // 3. VideoFrame from 2D canvas — the only reliably working source
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