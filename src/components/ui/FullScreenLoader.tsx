interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({ message = 'Validating Session...' }: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 min-h-screen w-screen bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center p-4 transition-colors"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-xl shadow-primary-500/25 font-bold text-lg animate-pulse">
          SD
        </div>

        {/* Spinner */}
        <div className="relative w-8 h-8">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800" />
          <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>

        {/* Message */}
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase">
          {message}
        </p>
      </div>
    </div>
  );
}
