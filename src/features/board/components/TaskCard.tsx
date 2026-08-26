import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, User } from '@/types/board';
import { PRIORITY_COLORS } from '@/utils/constants';
import { formatShortDate, isOverdue, isDueToday } from '@/utils/date';
import { cn } from '@/utils/cn';

export interface TaskCardProps {
  task: Task;
  assignee?: User;
  commentCount?: number;
  onClick: (task: Task) => void;
  onDelete: (task: Task) => void;
  isOverlay?: boolean;
}

export const TaskCard = memo(function TaskCard({
  task,
  assignee,
  commentCount = 0,
  onClick,
  onDelete,
  isOverlay = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const overdue = task.status !== 'done' && isOverdue(task.dueDate);
  const dueToday = task.status !== 'done' && isDueToday(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="button"
      aria-label={`Task ${task.title}, priority ${task.priority}, status ${task.status}`}
      onClick={(e) => {
        // Prevent opening drawer if user clicked delete button
        if ((e.target as HTMLElement).closest('[data-action="delete"]')) {
          return;
        }
        onClick(task);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      className={cn(
        'group relative rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 p-4',
        'shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150',
        'cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isDragging && 'opacity-30 ring-2 ring-primary-500 scale-95 shadow-lg',
        isOverlay && 'shadow-2xl border-primary-500 ring-2 ring-primary-500 rotate-1 cursor-grabbing'
      )}
    >
      {/* Header: Task ID & Priority Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">
          SD-{task.id}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider',
              priorityStyle.bg,
              priorityStyle.text
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', priorityStyle.dot)} />
            {task.priority}
          </span>

          {/* Quick Delete button */}
          <button
            type="button"
            data-action="delete"
            aria-label={`Delete task SD-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-1.5">
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: Due Date, Comments, and Assignee Avatar */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          {/* Due date */}
          <div
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-medium',
              overdue
                ? 'text-red-600 dark:text-red-400 font-semibold'
                : dueToday
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500'
            )}
            title={overdue ? 'Overdue' : dueToday ? 'Due today' : `Due on ${task.dueDate}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatShortDate(task.dueDate)}</span>
          </div>

          {/* Comments count */}
          {commentCount > 0 && (
            <div
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500"
              title={`${commentCount} comments`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{commentCount}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee && (
          <div className="relative group/avatar" title={`Assigned to ${assignee.name}`}>
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
            />
          </div>
        )}
      </div>
    </div>
  );
});
