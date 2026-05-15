// data/constants.js

export const GRADIENT_META = {
    mercury: { label: 'Mercury' },
    wave: { label: 'Flowing wave' },
    aurora: { label: 'Aurora mesh' },
    plasma: { label: 'Plasma field' },
};

export const GRADIENT_DEFAULTS = {
    mercury: {
        paletteIndex: 0,
        flow: 0.4,   // warp evolution speed
        scale: 1.0,   // spatial zoom
        sheen: 0.5,   // specular highlight intensity
        noise: 0.06,  // grain overlay
        colors: ['#040621', '#141164', '#2b2d89', '#ce6b62', '#e0aba1', '#e4c8c1'],
    },
    wave: {
        paletteIndex: 0,
        waveAmp: 1.0,
        waveSpeed: 1.0,
        blurAmt: 0.5,
        scale: 1.0,   // ← add this
        colors: ['#040621', '#141164', '#2b2d89', '#ce6b62', '#e0aba1', '#e4c8c1'],
    },
    aurora: {
        paletteIndex: 0,
        blobSize: 0.1,
        palSpeed: 0.05,
        colors: ['#040621', '#141164', '#2b2d89', '#ce6b62', '#e0aba1', '#e4c8c1'],
    },
    plasma: {
        paletteIndex: 0,
        density: 1.0,
        warp: 0.0,
        colors: ['#040621', '#141164', '#2b2d89', '#ce6b62', '#e0aba1', '#e4c8c1'],
    },
};