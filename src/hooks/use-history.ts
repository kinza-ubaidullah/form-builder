import { useState, useCallback } from 'react';

interface UseHistoryResult<T> {
    state: T;
    setState: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    reset: (newState: T) => void;
    canUndo: boolean;
    canRedo: boolean;
    history: T[];
    pointer: number;
}

export function useHistory<T>(initialState: T): UseHistoryResult<T> {
    const [stateHistory, setStateHistory] = useState<{
        history: T[];
        pointer: number;
    }>({
        history: [initialState],
        pointer: 0,
    });

    const setState = useCallback(
        (newState: T) => {
            setStateHistory((prev) => {
                const newHistory = prev.history.slice(0, prev.pointer + 1);
                newHistory.push(newState);
                return {
                    history: newHistory,
                    pointer: newHistory.length - 1,
                };
            });
        },
        []
    );

    const undo = useCallback(() => {
        setStateHistory((prev) => ({
            ...prev,
            pointer: Math.max(0, prev.pointer - 1),
        }));
    }, []);

    const redo = useCallback(() => {
        setStateHistory((prev) => ({
            ...prev,
            pointer: Math.min(prev.history.length - 1, prev.pointer + 1),
        }));
    }, []);

    const reset = useCallback((newState: T) => {
        setStateHistory({
            history: [newState],
            pointer: 0,
        });
    }, []);

    const { history, pointer } = stateHistory;

    return {
        state: history[pointer],
        setState,
        undo,
        redo,
        reset,
        canUndo: pointer > 0,
        canRedo: pointer < history.length - 1,
        history,
        pointer,
    };
}
