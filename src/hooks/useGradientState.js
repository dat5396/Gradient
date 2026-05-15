import { useState, useCallback } from 'react';
import { GRADIENT_DEFAULTS } from '../data/constants';
import { PALETTES } from '../data/palettes';


export function useGradientState() {
  const [activeGradient, setActiveGradient] = useState('mercury');
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 1920, h: 1080 });
  const [params, setParams] = useState(GRADIENT_DEFAULTS);

  const updateParam = useCallback((gradient, key, value) => {
    setParams((prev) => ({
      ...prev,
      [gradient]: { ...prev[gradient], [key]: value },
    }));
  }, []);

  // Switches gradient style while preserving the current color palette
  const switchGradient = useCallback((newGradient) => {
    setParams((prev) => ({
      ...prev,
      [newGradient]: {
        ...prev[newGradient],
        colors: prev[activeGradient].colors,
      },
    }));
    setActiveGradient(newGradient);
  }, [activeGradient]);

  const randomizePalette = useCallback(() => {
    const template = PALETTES.template;
    if (!template?.length) return;

    const currentColors = params[activeGradient]?.colors;
    const available = template.filter(
      (p) => p.colors.join() !== currentColors?.join()
    );
    const pool = available.length ? available : template;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    setParams((prev) => ({
      ...prev,
      [activeGradient]: {
        ...prev[activeGradient],
        colors: picked.colors,
      },
    }));
  }, [activeGradient, params]);

  return {
    activeGradient,
    setActiveGradient: switchGradient,
    speed, setSpeed,
    paused, setPaused,
    canvasSize, setCanvasSize,
    params, updateParam,
    randomizePalette,
  };
}