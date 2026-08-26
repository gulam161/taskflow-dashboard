import { create } from 'zustand';
import type { Task, TaskStatus, TaskPriority } from '@/types/board';
import { TASKS_PER_PAGE } from '@/utils/constants';

/**
 * Zustand store for Task Management UI state only.
 * No server/task data stored here — that lives in TanStack Query cache.
 */
export interface TaskUIState {
  // Search & Filters (controlled input values)
  searchInput: string;
  filterStatus: TaskStatus | 'all';
  filterPriority: TaskPriority | 'all';

  // Sorting
  sortOrder: 'asc' | 'desc';

  // Pagination
  currentPage: number;
  pageSize: number;

  // Modal state
  isFormModalOpen: boolean;
  editingTask: Task | null; // null = create mode, Task = edit mode
  taskToDelete: Task | null;

  // Detail drawer
  selectedTaskId: number | null;

  // Setters
  setSearchInput: (q: string) => void;
  setFilterStatus: (s: TaskStatus | 'all') => void;
  setFilterPriority: (p: TaskPriority | 'all') => void;
  toggleSortOrder: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeFormModal: () => void;
  setTaskToDelete: (task: Task | null) => void;
  setSelectedTaskId: (id: number | null) => void;
  resetFilters: () => void;
}

export const useTaskUIStore = create<TaskUIState>((set) => ({
  searchInput: '',
  filterStatus: 'all',
  filterPriority: 'all',
  sortOrder: 'asc',
  currentPage: 1,
  pageSize: TASKS_PER_PAGE,
  isFormModalOpen: false,
  editingTask: null,
  taskToDelete: null,
  selectedTaskId: null,

  setSearchInput: (q) => set({ searchInput: q, currentPage: 1 }),
  setFilterStatus: (s) => set({ filterStatus: s, currentPage: 1 }),
  setFilterPriority: (p) => set({ filterPriority: p, currentPage: 1 }),
  toggleSortOrder: () =>
    set((state) => ({
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
      currentPage: 1,
    })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  openCreateModal: () => set({ isFormModalOpen: true, editingTask: null }),
  openEditModal: (task) => set({ isFormModalOpen: true, editingTask: task }),
  closeFormModal: () => set({ isFormModalOpen: false, editingTask: null }),
  setTaskToDelete: (task) => set({ taskToDelete: task }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  resetFilters: () =>
    set({
      searchInput: '',
      filterStatus: 'all',
      filterPriority: 'all',
      sortOrder: 'asc',
      currentPage: 1,
    }),
}));
