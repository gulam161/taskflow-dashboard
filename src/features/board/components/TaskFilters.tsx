import type { TaskPriority, User } from '@/types/board';
import { TASK_PRIORITIES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

interface TaskFiltersProps {
  searchQuery: string;
  filterPriority: TaskPriority | 'all';
  filterAssigneeId: number | 'all';
  users: User[];
  canUndo: boolean;
  onSearchChange: (query: string) => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onAssigneeChange: (assigneeId: number | 'all') => void;
  onResetFilters: () => void;
  onUndoMove: () => void;
  onAddTask: () => void;
}

export function TaskFilters({
  searchQuery,
  filterPriority,
  filterAssigneeId,
  users,
  canUndo,
  onSearchChange,
  onPriorityChange,
  onAssigneeChange,
  onResetFilters,
  onUndoMove,
  onAddTask,
}: TaskFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' || filterPriority !== 'all' || filterAssigneeId !== 'all';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs transition-colors">
      {/* Left controls: Search, Priority filter, Assignee filter */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search input */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          aria-label="Filter by priority"
          value={filterPriority}
          onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
          className="text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize"
        >
          <option value="all">All Priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p} Priority
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          aria-label="Filter by assignee"
          value={filterAssigneeId}
          onChange={(e) =>
            onAssigneeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          className="text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium px-2 py-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Right controls: Undo button & Add Task button */}
      <div className="flex items-center gap-2 shrink-0">
        {canUndo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUndoMove}
            leftIcon={
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            }
          >
            Undo Move
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onAddTask}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Task
        </Button>
      </div>
    </div>
  );
}
