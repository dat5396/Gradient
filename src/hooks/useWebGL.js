import { useRef, useEffect } from 'react';

const VERT_SRC = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0, 1); }`;

function hexToVec3(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
}

export function useWebGL(canvasRef) {
    const glRef = useRef(null);
    const bufRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
        if (!gl) { console.error('WebGL not available'); return; }
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        glRef.current = gl;
        bufRef.current = buf;
        return () => {
            gl.deleteBuffer(buf);
            glRef.current = null;
            bufRef.current = null;
        };
    }, [canvasRef]);

    function compileProgram(fsSrc) {
        const gl = glRef.current;
        if (!gl) return null;
        function mkShader(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                console.error('Shader error:', gl.getShaderInfoLog(s));
            return s;
        }
        const prog = gl.createProgram();
        gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT_SRC));
        gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fsSrc));
        gl.linkProgram(prog);
        return prog;
    }

    function drawFrame(prog, setUniforms) {
        const gl = glRef.current;
        const buf = bufRef.current;
        if (!gl || !buf || !prog) return;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        const loc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        setUniforms(gl, prog);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Always pads to 8 slots so the uniform array size stays constant
    function setColors(gl, prog, uniformName, hexColors) {
        const padded = [...hexColors];
        while (padded.length < 8) padded.push('#000000');
        const flat = padded.flatMap(hexToVec3);
        const loc = gl.getUniformLocation(prog, uniformName);
        if (loc) gl.uniform3fv(loc, flat);

        const countLoc = gl.getUniformLocation(prog, 'uColorCount');
        if (countLoc) gl.uniform1i(countLoc, hexColors.length);
    }

    // Add inside useWebGL, alongside compileProgram/drawFrame/setColors:
    function createOffscreenContext(width, height) {
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const gl = offscreen.getContext('webgl', { preserveDrawingBuffer: true }) ||
            offscreen.getContext('experimental-webgl', { preserveDrawingBuffer: true });
        return { canvas: offscreen, gl };
    }

    // update return:
    return { gl: glRef, compileProgram, drawFrame, setColors, createOffscreenContext };
}