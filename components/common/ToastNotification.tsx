import React, { useEffect, useState } from 'react';
import { ToastContext, Toast, ToastType, useToast } from '../../context/ToastContext';
import { CloseIcon, CheckCircleIcon } from './Icons';

// ─── Individual Toast Item ─────────────────────────────────────────────────────

const typeConfig: Record<ToastType, { bar: string; icon: React.ReactNode; bg: string; titleColor: string }> = {
    success: {
        bar: 'bg-emerald-500',
        bg: 'bg-white dark:bg-gray-800 border-l-4 border-emerald-500',
        titleColor: 'text-emerald-700 dark:text-emerald-300',
        icon: (
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
    },
    error: {
        bar: 'bg-red-500',
        bg: 'bg-white dark:bg-gray-800 border-l-4 border-red-500',
        titleColor: 'text-red-700 dark:text-red-300',
        icon: (
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
        ),
    },
    warning: {
        bar: 'bg-amber-500',
        bg: 'bg-white dark:bg-gray-800 border-l-4 border-amber-500',
        titleColor: 'text-amber-700 dark:text-amber-300',
        icon: (
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
        ),
    },
    info: {
        bar: 'bg-blue-500',
        bg: 'bg-white dark:bg-gray-800 border-l-4 border-blue-500',
        titleColor: 'text-blue-700 dark:text-blue-300',
        icon: (
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </div>
        ),
    },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const cfg = typeConfig[toast.type];

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 320);
    };

    useEffect(() => {
        // Mount animation
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const leaveTime = toast.duration - 350;
            const t = setTimeout(() => setExiting(true), Math.max(leaveTime, 100));
            return () => clearTimeout(t);
        }
    }, [toast.duration]);

    const translateClass = visible && !exiting
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0';

    return (
        <div
            className={`relative flex items-start gap-3 w-full max-w-sm rounded-xl shadow-xl p-3.5 pr-10 transition-all duration-300 ease-out ${cfg.bg} ${translateClass}`}
            role="alert"
        >
            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <div
                    className={`absolute bottom-0 left-0 h-0.5 rounded-b-xl ${cfg.bar} opacity-60`}
                    style={{
                        animation: `toast-progress ${toast.duration}ms linear forwards`,
                        width: '100%',
                    }}
                />
            )}

            {cfg.icon}

            <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-semibold leading-tight ${cfg.titleColor}`}>{toast.title}</p>
                {toast.message && (
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{toast.message}</p>
                )}
            </div>

            <button
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Dismiss notification"
            >
                <CloseIcon className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// ─── Toast Container (render in App root) ─────────────────────────────────────

export const ToastContainer: React.FC = () => {
    const { toasts, dismissToast } = useToast();

    return (
        <>
            <style>{`
                @keyframes toast-progress {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
            <div
                className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none"
                aria-live="polite"
                aria-label="Notifications"
            >
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismissToast} />
                    </div>
                ))}
            </div>
        </>
    );
};

export { useToast };
