import { Button } from '@/components/ui/Button';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Reusable network error banner.
 * Displays an error message with an optional retry button.
 */
export function NetworkError({
  message = 'Something went wrong while loading data.',
  onRetry,
}: NetworkErrorProps) {
  return (
    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-0.5">
            Failed to Load
          </h3>
          <p className="text-xs text-red-700 dark:text-red-400">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <svg
              className="w-3.5 h-3.5 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
