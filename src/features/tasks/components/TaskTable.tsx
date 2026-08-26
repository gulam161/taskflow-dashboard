import { useMemo, useCallback } from 'react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import type { Task, TaskStatus, User } from '@/types/board';
import { PRIORITY_COLORS, TASK_STATUS_LABELS, KANBAN_COLUMNS } from '@/utils/constants';
import { formatDate, isOverdue } from '@/utils/date';

interface TaskTableProps {
  tasks: Task[];
  users: User[];
  loading?: boolean;
  onViewTask: (taskId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
}

/**
 * Task table component using the reusable DataTable.
 * Renders tasks with columns: Title, Status, Priority, Assignee, Due Date, Actions.
 */
export function TaskTable({
  tasks,
  users,
  loading = false,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskTableProps) {
  // User lookup map
  const usersMap = useMemo<Record<number, User>>(() => {
    const map: Record<number, User> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const handleStatusChange = useCallback(
    (taskId: number, status: string) => {
      onStatusChange(taskId, status as TaskStatus);
    },
    [onStatusChange]
  );

  const columns: Column<Task>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Task Title',
        className: 'min-w-[200px]',
        render: (task) => (
          <button
            type="button"
            onClick={() => onViewTask(task.id)}
            className="text-left font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
          >
            {task.title}
          </button>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (task) => (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value)}
            aria-label={`Change status for ${task.title}`}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {KANBAN_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {TASK_STATUS_LABELS[col.id]}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: 'priority',
        header: 'Priority',
        render: (task) => {
          const pStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${pStyle.bg} ${pStyle.text}`}
            >
              {task.priority}
            </span>
          );
        },
      },
      {
        key: 'assigneeId',
        header: 'Assignee',
        render: (task) => {
          const user = usersMap[task.assigneeId];
          if (!user) return <span className="text-xs text-slate-400">Unassigned</span>;
          return (
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
          );
        },
      },
      {
        key: 'dueDate',
        header: 'Due Date',
        render: (task) => {
          const overdue = task.status !== 'done' && isOverdue(task.dueDate);
          return (
            <span
              className={`text-xs font-medium ${
                overdue
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {formatDate(task.dueDate)}
              {overdue && ' (Overdue)'}
            </span>
          );
        },
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (task) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(task.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'center' as const,
        render: (task) => (
          <div className="flex items-center justify-center gap-1">
            {/* Edit */}
            <button
              type="button"
              onClick={() => onEditTask(task)}
              aria-label={`Edit ${task.title}`}
              title="Edit task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            {/* Delete */}
            <button
              type="button"
              onClick={() => onDeleteTask(task)}
              aria-label={`Delete ${task.title}`}
              title="Delete task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [usersMap, onViewTask, onEditTask, onDeleteTask, handleStatusChange]
  );

  return (
    <DataTable<Task>
      columns={columns}
      data={tasks}
      rowKey={(task) => task.id}
      loading={loading}
      loadingRows={5}
      emptyMessage="No tasks found"
      striped
      stickyHeader
    />
  );
}
