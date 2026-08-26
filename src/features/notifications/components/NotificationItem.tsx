import type { AppNotification } from '@/types/board';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const TYPE_ICONS: Record<AppNotification['type'], { icon: string; bg: string; text: string }> = {
  task: {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-600 dark:text-blue-400',
  },
  review: {
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-600 dark:text-amber-400',
  },
};


export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const typeStyle = TYPE_ICONS[notification.type] || TYPE_ICONS.task;

  return (
    <div
      className={cn(
        'group relative p-3.5 rounded-xl transition-all duration-150 flex items-start gap-3 border',
        notification.read
          ? 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100'
          : 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/40'
      )}
    >
      {/* Type Icon */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5',
          typeStyle.bg,
          typeStyle.text
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeStyle.icon} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1.5">
          <h4
            className={cn(
              'text-xs font-semibold truncate',
              notification.read
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-900 dark:text-white'
            )}
          >
            {notification.title}
          </h4>
          {!notification.read && (
            <span
              className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500"
              title="Unread notification"
            />
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {/* Action buttons (revealed on hover or mobile) */}
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            title="Mark as read"
            aria-label={`Mark "${notification.title}" as read`}
            className="p-1 rounded-md text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          title="Delete notification"
          aria-label={`Delete "${notification.title}"`}
          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
