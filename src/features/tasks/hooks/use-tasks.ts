import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../api/task-service';
import { useTaskUIStore } from '../store/task-ui-store';
import { useDebounce } from './use-debounce';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/board';

/**
 * Central hook for Task Management page.
 *
 * Architecture:
 *  - TanStack Query → server state (task data, CRUD)
 *  - Zustand (useTaskUIStore) → client/UI state (filters, modals, pagination)
 *  - useDebounce → 500ms debounced search
 */
export function useTasks() {
  const queryClient = useQueryClient();

  // ── UI State from Zustand ──────────────────────────────────────────────
  const {
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
  } = useTaskUIStore();

  // ── Debounced Search ───────────────────────────────────────────────────
  const debouncedSearch = useDebounce(searchInput);

  // ── TanStack Query: Fetch paginated tasks ──────────────────────────────
  const tasksQuery = useQuery({
    queryKey: [
      'tasks',
      {
        search: debouncedSearch,
        status: filterStatus,
        priority: filterPriority,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      },
    ],
    queryFn: () =>
      taskService.getTasks({
        search: debouncedSearch,
        status: filterStatus,
        priority: filterPriority,
        sortBy: 'dueDate',
        sortOrder,
        page: currentPage,
        limit: pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  // ── TanStack Query: Fetch users for dropdowns ──────────────────────────
  const usersQuery = useQuery({
    queryKey: ['task-users'],
    queryFn: () => taskService.getUsers(),
    staleTime: Infinity,
  });

  // ── TanStack Query: Dashboard summary ──────────────────────────────────
  const summaryQuery = useQuery({
    queryKey: ['task-summary'],
    queryFn: () => taskService.getTaskSummary(),
  });

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task-summary'] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      invalidateAll();
      closeFormModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateTaskPayload }) =>
      taskService.updateTask(id, updates),
    onSuccess: () => {
      invalidateAll();
      closeFormModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      invalidateAll();
      setTaskToDelete(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      taskService.updateTask(id, { status: status as UpdateTaskPayload['status'] }),
    onSuccess: () => {
      invalidateAll();
    },
  });

  // ── Return composite API ───────────────────────────────────────────────
  return {
    // Server state (TanStack Query)
    tasksQuery,
    usersQuery,
    summaryQuery,
    tasks: tasksQuery.data?.data ?? [],
    totalTasks: tasksQuery.data?.total ?? 0,
    totalPages: tasksQuery.data?.totalPages ?? 1,
    users: usersQuery.data ?? [],
    summary: summaryQuery.data ?? null,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    statusMutation,

    // UI state (Zustand)
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

    // UI actions (Zustand)
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
  };
}
