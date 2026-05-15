import { useRef, useEffect, useCallback } from 'react';

export function useAnimationFrame({ paused, speed }) {
    const t0 = useRef(performance.now());
    const pauseOffset = useRef(0);
    const pauseStart = useRef(null);
    const speedRef = useRef(speed);

    // Keep speedRef current without resetting time origin
    useEffect(() => { speedRef.current = speed; }, [speed]);

    useEffect(() => {
        if (paused) {
            pauseStart.current = performance.now();
        } else {
            if (pauseStart.current !== null) {
                pauseOffset.current += performance.now() - pauseStart.current;
                pauseStart.current = null;
            }
        }
    }, [paused]);

    const getTime = useCallback(() => {
        if (paused) {
            const frozenAt = pauseStart.current ?? performance.now();
            return ((frozenAt - t0.current - pauseOffset.current) / 1000) * speedRef.current;
        }
        return ((performance.now() - t0.current - pauseOffset.current) / 1000) * speedRef.current;
    }, [paused]);

    return { getTime };
}