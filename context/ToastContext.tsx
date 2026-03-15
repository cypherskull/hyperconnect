import React, { createContext, useState, useCallback, ReactNode, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    // AudioContext for subtle sounds
    const audioCtxRef = useRef<AudioContext | null>(null);

    const playSound = useCallback((type: ToastType) => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

            if (type === 'success') {
                // Two-tone rising chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.12); // G5
            } else if (type === 'error') {
                // Low descending buzz
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
            } else if (type === 'warning') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(660, ctx.currentTime);
                osc.frequency.setValueAtTime(550, ctx.currentTime + 0.1);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(660, ctx.currentTime);
            }

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.45);
        } catch (_) {
            // Silently ignore audio failures (e.g., autoplay policy)
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }]);
        playSound(type);
        if (duration > 0) {
            setTimeout(() => dismissToast(id), duration);
        }
    }, [playSound, dismissToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
        </ToastContext.Provider>
    );
};
