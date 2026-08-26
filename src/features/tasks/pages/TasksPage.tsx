import { useMemo } from "react";
import { useTasks } from "../hooks/use-tasks";
import { TaskManagementFilters } from "../components/TaskManagementFilters";
import { TaskTable } from "../components/TaskTable";
import { TaskFormModal } from "../components/TaskFormModal";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../components/EmptyState";
import { NetworkError } from "../components/NetworkError";
import { DeleteConfirmModal } from "@/features/board/components/DeleteConfirmModal";
import { TaskDrawer } from "@/features/board/components/TaskDrawer";
import { toast } from "@/components/ui/toast-store";
import { Button } from "@/components/ui/Button";
import type { Task, TaskStatus, User } from "@/types/board";
import { DashboardSummaryCards } from "../components/DashboardSummaryCards";

export function TasksPage() {
  const {
    // TanStack Query Server State
    tasksQuery,
    tasks,
    totalTasks,
    totalPages,
    users,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    statusMutation,

    // Zustand UI State
    searchInput,
    filterStatus,
    filterPriority,
    sortOrder,
    currentPage,
    pageSize,
    isFormModalOpen,
    editingTask,
    taskToDelete,
    selectedTaskId,

    // UI Actions
    setSearchInput,
    setFilterStatus,
    setFilterPriority,
    toggleSortOrder,
    setCurrentPage,
    setPageSize,
    openCreateModal,
    openEditModal,
    closeFormModal,
    setTaskToDelete,
    setSelectedTaskId,
    resetFilters,
  } = useTasks();

  // Users map for fast ID lookup
  const usersMap = useMemo<Record<number, User>>(() => {
    const map: Record<number, User> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Selected task for drawer
  const selectedTask = useMemo<Task | null>(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Handle Create
  const handleCreateTask = (
    payload: Parameters<typeof createMutation.mutate>[0],
  ) => {
    createMutation.mutate(payload, {
      onSuccess: (newTask) => {
        toast(`Task "${newTask.title}" created successfully`, "success");
      },
      onError: (err) => {
        toast(`Failed to create task: ${err.message}`, "error");
      },
    });
  };

  // Handle Update
  const handleUpdateTask = (
    data: Parameters<typeof updateMutation.mutate>[0],
  ) => {
    updateMutation.mutate(data, {
      onSuccess: (updated) => {
        toast(`Task "${updated.title}" updated successfully`, "success");
      },
      onError: (err) => {
        toast(`Failed to update task: ${err.message}`, "error");
      },
    });
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = (taskId: number) => {
    deleteMutation.mutate(taskId, {
      onSuccess: () => {
        toast("Task deleted successfully", "success");
        if (selectedTaskId === taskId) {
          setSelectedTaskId(null);
        }
      },
      onError: (err) => {
        toast(`Failed to delete task: ${err.message}`, "error");
      },
    });
  };

  // Handle Quick Status Change
  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    statusMutation.mutate(
      { id: taskId, status },
      {
        onSuccess: () => {
          toast("Task status updated", "success");
        },
        onError: (err) => {
          toast(`Failed to update status: ${err.message}`, "error");
        },
      },
    );
  };

  const hasActiveFilters =
    searchInput.trim() !== "" ||
    filterStatus !== "all" ||
    filterPriority !== "all";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, sort, and manage project tasks with real-time status
            updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={openCreateModal}
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Create Task
          </Button>
        </div>
      </div>

      <DashboardSummaryCards />

      {/* Filter Toolbar */}
      <TaskManagementFilters
        searchInput={searchInput}
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        sortOrder={sortOrder}
        onSearchChange={setSearchInput}
        onStatusChange={setFilterStatus}
        onPriorityChange={setFilterPriority}
        onToggleSort={toggleSortOrder}
        onResetFilters={resetFilters}
        onAddTask={openCreateModal}
      />

      {/* Network Error Banner */}
      {tasksQuery.isError && (
        <NetworkError
          message={
            tasksQuery.error?.message || "Failed to fetch tasks from service"
          }
          onRetry={() => tasksQuery.refetch()}
        />
      )}

      {/* Main Table View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {!tasksQuery.isError && !tasksQuery.isLoading && tasks.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No tasks found" : "No tasks created yet"}
            description={
              hasActiveFilters
                ? "No tasks match your current search query or filter criteria. Try clearing your filters."
                : "Get started by creating your first project task."
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : "Create Task"}
            onAction={hasActiveFilters ? resetFilters : openCreateModal}
          />
        ) : (
          <>
            <TaskTable
              tasks={tasks}
              users={users}
              loading={tasksQuery.isLoading}
              onViewTask={(id) => setSelectedTaskId(id)}
              onEditTask={(task) => openEditModal(task)}
              onDeleteTask={(task) => setTaskToDelete(task)}
              onStatusChange={handleStatusChange}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalTasks}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

      {/* Create / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        editingTask={editingTask}
        users={users}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={closeFormModal}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Task Details Side Drawer */}
      <TaskDrawer
        task={selectedTask}
        users={users}
        usersMap={usersMap}
        comments={[]}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={(id, updates) => handleUpdateTask({ id, updates })}
        onDelete={(task) => setTaskToDelete(task)}
        onAddComment={(_id, _author, _msg) => {
          toast("Comments are managed in Sprint Board", "info");
        }}
      />
    </div>
  );
}

export default TasksPage;
