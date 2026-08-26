import { useCallback, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import {
  type ToastVariant,
  type ToastData,
  dismissToast,
  useToasts,
} from './toast-store';

export type { ToastVariant, ToastData };
/* eslint-disable-next-line react-refresh/only-export-components */
export { toast, dismissToast, useToast } from './toast-store';


// ────────────────────────────────────────────────────────────────────────────
// Toast Icon
// ────────────────────────────────────────────────────────────────────────────

const ICONS: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3L2 21h20L12 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
};

const BG: Record<ToastVariant, string> = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
};

// ────────────────────────────────────────────────────────────────────────────
// Single toast component
// ────────────────────────────────────────────────────────────────────────────

function ToastItem({ data }: { data: ToastData }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const dismiss = useCallback(() => dismissToast(data.id), [data.id]);

  useEffect(() => {
    if (data.duration && data.duration > 0) {
      timerRef.current = setTimeout(dismiss, data.duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [data.duration, dismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-in-up',
        BG[data.variant]
      )}
    >
      <div className="shrink-0 mt-0.5">{ICONS[data.variant]}</div>
      <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
        {data.message}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Toast container — mount once in app root
// ────────────────────────────────────────────────────────────────────────────

export function ToastContainer() {
  const items = useToasts();

  if (items.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 min-w-[320px] max-w-md">
      {items.map((t) => (
        <ToastItem key={t.id} data={t} />
      ))}
    </div>,
    document.body
  );
}
