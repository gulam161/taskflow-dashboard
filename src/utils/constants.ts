import type { TaskStatus } from '@/types/common';

/** API base URLs */
export const API_BASE_URL = 'https://dummyjson.com';
export const JSON_PLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com';

/** Notification polling interval in milliseconds */
export const NOTIFICATION_POLL_INTERVAL = 30_000;

/** Maximum notifications to display in the panel */
export const MAX_NOTIFICATIONS_DISPLAY = 20;

/** Notifications per page for pagination */
export const NOTIFICATIONS_PER_PAGE = 20;

/** Kanban column definitions */
export const KANBAN_COLUMNS = [
  { id: 'backlog' as const, title: 'Backlog' },
  { id: 'in-progress' as const, title: 'In Progress' },
  { id: 'review' as const, title: 'Review' },
  { id: 'done' as const, title: 'Done' },
] as const;

/** Task priority options */
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

/** Task priority colors for UI display */
export const PRIORITY_COLORS = {
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
} as const;

/** Column status colors */
export const STATUS_COLORS: Record<TaskStatus, string> = {
  'backlog': 'bg-slate-400',
  'in-progress': 'bg-blue-500',
  'review': 'bg-amber-500',
  'done': 'bg-green-500',
};

/** Number of tasks to fetch from mock data */
export const INITIAL_TASK_LIMIT = 30;

