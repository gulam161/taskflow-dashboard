import type { TaskStatus, TaskPriority } from '@/types/board';
import { TASK_PRIORITIES, TASK_STATUS_LABELS, TASK_STATUSES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

interface TaskManagementFiltersProps {
  searchInput: string;
  filterStatus: TaskStatus | 'all';
  filterPriority: TaskPriority | 'all';
  sortOrder: 'asc' | 'desc';
  onSearchChange: (query: string) => void;
  onStatusChange: (status: TaskStatus | 'all') => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onToggleSort: () => void;
  onResetFilters: () => void;
  onAddTask: () => void;
}

/**
 * Filter toolbar for the Task Management page.
 * Search (debounced by parent), Status filter, Priority filter,
 * Sort by Due Date toggle, Reset, and Add Task button.
 */
export function TaskManagementFilters({
  searchInput,
  filterStatus,
  filterPriority,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onToggleSort,
  onResetFilters,
  onAddTask,
}: TaskManagementFiltersProps) {
  const hasActiveFilters =
    searchInput.trim() !== '' || filterStatus !== 'all' || filterPriority !== 'all';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs transition-colors">
      {/* Left controls: Search + Filters */}
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
            id="task-search-input"
            type="text"
            placeholder="Search tasks by title..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          />
          {searchInput && (
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

        {/* Status Filter */}
        <select
          id="task-status-filter"
          aria-label="Filter by status"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'all')}
          className="text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {TASK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          id="task-priority-filter"
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

        {/* Sort by Due Date toggle */}
        <button
          type="button"
          onClick={onToggleSort}
          aria-label={`Sort by due date ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          title={`Due Date: ${sortOrder === 'asc' ? 'Earliest first' : 'Latest first'}`}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Due Date
          <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        </button>

        {/* Reset filters */}
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

      {/* Right controls: Add Task */}
      <div className="flex items-center gap-2 shrink-0">
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
