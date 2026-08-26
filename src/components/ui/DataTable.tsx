import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  /** Custom cell renderer. Falls back to `row[key]`. */
  render?: (row: T) => ReactNode;
  /** Column width class */
  className?: string;
  /** Enables text alignment */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Key extractor for stable row identity */
  rowKey: (row: T) => string | number;
  /** Empty state */
  emptyMessage?: string;
  /** Optional striped rows */
  striped?: boolean;
  /** Optional sticky header */
  stickyHeader?: boolean;
  /** Loading skeleton row count */
  loading?: boolean;
  loadingRows?: number;
  /** Optional className on wrapper */
  className?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

const ALIGN_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No data available',
  striped = false,
  stickyHeader = false,
  loading = false,
  loadingRows = 5,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        'w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <table className="w-full text-sm">
        <thead
          className={cn(
            'bg-slate-50 dark:bg-slate-800/60',
            stickyHeader && 'sticky top-0 z-10'
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap',
                  ALIGN_CLASSES[col.align ?? 'left'],
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {loading
            ? Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                    striped && idx % 2 === 1 && 'bg-slate-50/50 dark:bg-slate-800/30'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-slate-700 dark:text-slate-300',
                        ALIGN_CLASSES[col.align ?? 'left'],
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
