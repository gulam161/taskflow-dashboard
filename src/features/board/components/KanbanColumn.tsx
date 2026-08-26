import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus, User } from '@/types/board';
import { STATUS_COLORS } from '@/utils/constants';
import { TaskCard } from './TaskCard';
import { cn } from '@/utils/cn';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  usersMap: Record<number, User>;
  commentCounts: Record<number, number>;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  id,
  title,
  tasks,
  usersMap,
  commentCounts,
  onTaskClick,
  onTaskDelete,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      status: id,
    },
  });

  const taskIds = tasks.map((t) => t.id);
  const statusColor = STATUS_COLORS[id] || 'bg-slate-400';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3.5',
        'transition-colors duration-150',
        isOver && 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-300 dark:border-primary-800/80'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', statusColor)} />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            {title}
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Task button */}
        <button
          type="button"
          onClick={() => onAddTask(id)}
          aria-label={`Add task to ${title}`}
          title={`Add task to ${title}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Sortable Tasks Area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[150px] pr-0.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={usersMap[task.assigneeId]}
              commentCount={commentCounts[task.id] || 0}
              onClick={onTaskClick}
              onDelete={onTaskDelete}
            />
          ))}

          {tasks.length === 0 && (
            <div className="h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                No tasks
              </p>
              <button
                type="button"
                onClick={() => onAddTask(id)}
                className="mt-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                + Add a task
              </button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
});
