import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
    onSave: () => Promise<void> | void;
    delay?: number;
    enabled?: boolean;
}

export function useAutoSave({ onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const isSavingRef = useRef(false);

    const save = useCallback(async () => {
        if (isSavingRef.current || !enabled) return;

        isSavingRef.current = true;
        try {
            await onSave();
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            isSavingRef.current = false;
        }
    }, [onSave, enabled]);

    const debouncedSave = useCallback(() => {
        if (!enabled) return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            save();
        }, delay);
    }, [save, delay, enabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { debouncedSave, save };
}
