/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const fnRef = useRef(fn);
    fnRef.current = fn;

    return useCallback((...args: Parameters<T>) => {
        if (!timerRef.current) {
            fnRef.current(...args);
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
            }, delay);
        }
    }, [delay]);
}

export function useDebounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const fnRef = useRef(fn);
    fnRef.current = fn;

    return useCallback((...args: Parameters<T>) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            fnRef.current(...args);
        }, delay);
    }, [delay]);
}