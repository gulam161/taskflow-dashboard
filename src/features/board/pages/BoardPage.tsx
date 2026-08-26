import { useCallback } from 'react';
import { useBoard } from '../hooks/use-board';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskFilters } from '../components/TaskFilters';
import { TaskDrawer } from '../components/TaskDrawer';
import { AddTaskModal } from '../components/AddTaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Task, TaskStatus } from '@/types/board';

export function BoardPage() {
  const {
    tasks,
    allTasksCount,
    columnTasks,
    users,
    usersMap,
    commentCounts,
    selectedTask,
    selectedTaskComments,
    taskToDelete,
    isAddTaskModalOpen,
    addTaskDefaultStatus,
    canUndo,
    isLoading,
    isError,
    error,
    refetch,
    filterPriority,
    filterAssigneeId,
    searchQuery,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    undoLastMove,
    setSelectedTaskId,
    setTaskToDelete,
    setIsAddTaskModalOpen,
    setFilterPriority,
    setFilterAssigneeId,
    setSearchQuery,
    resetFilters,
  } = useBoard();

  const handleOpenAddTask = useCallback(
    (status: TaskStatus = 'backlog') => {
      setIsAddTaskModalOpen(true, status);
    },
    [setIsAddTaskModalOpen]
  );

  const handleTaskClick = useCallback(
    (task: Task) => {
      setSelectedTaskId(task.id);
    },
    [setSelectedTaskId]
  );

  const handleTaskDeletePrompt = useCallback(
    (task: Task) => {
      setTaskToDelete(task);
    },
    [setTaskToDelete]
  );

  const handleConfirmDelete = useCallback(
    (taskId: number) => {
      deleteTask(taskId);
    },
    [deleteTask]
  );

  // Loading state with Skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={220} height={28} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </div>

        <Skeleton variant="rectangular" height={56} className="w-full rounded-2xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-4 space-y-3 min-h-[450px]"
            >
              <div className="flex justify-between items-center mb-2">
                <Skeleton variant="text" width={90} height={18} />
                <Skeleton variant="circular" width={24} height={24} />
              </div>
              <Skeleton variant="rectangular" height={100} className="w-full rounded-xl" />
              <Skeleton variant="rectangular" height={100} className="w-full rounded-xl" />
              <Skeleton variant="rectangular" height={100} className="w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Failed to load sprint board
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {error?.message || 'An unexpected error occurred while fetching sprint data.'}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => refetch()}>
          Retry Loading
        </Button>
      </div>
    );
  }

  const completedCount = columnTasks['done']?.length || 0;
  const progressPercent = allTasksCount > 0 ? Math.round((completedCount / allTasksCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Board Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sprint 3 Board
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Live Sprint
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aug 17 – Aug 28, 2026 • {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} shown ({allTasksCount} total)
          </p>
        </div>

        {/* Sprint Progress Pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Sprint Completion
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {progressPercent}% <span className="text-xs font-normal text-slate-400">({completedCount}/{allTasksCount})</span>
            </span>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-slate-200 dark:text-slate-800"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-primary-500 transition-all duration-500"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={100 - progressPercent}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <TaskFilters
        searchQuery={searchQuery}
        filterPriority={filterPriority}
        filterAssigneeId={filterAssigneeId}
        users={users}
        canUndo={canUndo}
        onSearchChange={setSearchQuery}
        onPriorityChange={setFilterPriority}
        onAssigneeChange={setFilterAssigneeId}
        onResetFilters={resetFilters}
        onUndoMove={undoLastMove}
        onAddTask={() => handleOpenAddTask('backlog')}
      />

      {/* Interactive Kanban Board */}
      <KanbanBoard
        columnTasks={columnTasks}
        usersMap={usersMap}
        commentCounts={commentCounts}
        onMoveTask={moveTask}
        onTaskClick={handleTaskClick}
        onTaskDelete={handleTaskDeletePrompt}
        onAddTask={handleOpenAddTask}
      />

      {/* Task Details Side Drawer */}
      <TaskDrawer
        task={selectedTask}
        users={users}
        usersMap={usersMap}
        comments={selectedTaskComments}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={updateTask}
        onDelete={handleTaskDeletePrompt}
        onAddComment={addComment}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        defaultStatus={addTaskDefaultStatus}
        users={users}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={addTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default BoardPage;
