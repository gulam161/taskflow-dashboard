import mockDataRaw from '../../../../mock-data.json';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus, TaskPriority } from '@/types/board';
import type { MockData } from '@/types/board';
import { INITIAL_TASK_LIMIT } from '@/utils/constants';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface TaskQueryParams {
  search?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  sortBy?: 'dueDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskSummary {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
}

// ────────────────────────────────────────────────────────────────────────────
// In-memory data store (simulates backend database)
// ────────────────────────────────────────────────────────────────────────────

const rawData = mockDataRaw as unknown as MockData;

/** Mutable in-memory task store — loaded once from mock-data.json */
let taskStore: Task[] = (rawData.tasks || []).slice(0, INITIAL_TASK_LIMIT).map((t) => ({ ...t }));

/** Users reference (read-only) */
export const usersRef = rawData.users || [];

/** Counter for generating unique IDs */
let nextId = taskStore.reduce((max, t) => Math.max(max, t.id), 0) + 1;

/** Simulate network latency */
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

// ────────────────────────────────────────────────────────────────────────────
// Service API
// ────────────────────────────────────────────────────────────────────────────

export const taskService = {
  /**
   * Fetch tasks with filtering, sorting, and pagination.
   * Mirrors a real paginated GET /api/tasks endpoint.
   */
  async getTasks(params: TaskQueryParams = {}): Promise<PaginatedResponse<Task>> {
    await delay();

    const {
      search = '',
      status = 'all',
      priority = 'all',
      sortBy,
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = params;

    let filtered = [...taskStore];

    // Search by title
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }

    // Filter by priority
    if (priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    // Sort by due date
    if (sortBy === 'dueDate') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      page: safePage,
      limit,
      totalPages,
    };
  },

  /**
   * Fetch a single task by ID.
   */
  async getTaskById(id: number): Promise<Task> {
    await delay(50);

    const task = taskStore.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return { ...task };
  },

  /**
   * Create a new task.
   */
  async createTask(payload: CreateTaskPayload): Promise<Task> {
    await delay(100);

    const now = new Date().toISOString();
    const columnTasks = taskStore.filter((t) => t.status === payload.status);

    const newTask: Task = {
      id: nextId++,
      title: payload.title.trim(),
      description: payload.description.trim(),
      status: payload.status,
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate,
      sprintId: payload.sprintId || 3,
      order: columnTasks.length + 1,
      createdAt: now,
      completedAt: payload.status === 'done' ? now : null,
      updatedAt: now,
    };

    taskStore = [...taskStore, newTask];
    return { ...newTask };
  },

  /**
   * Update an existing task.
   */
  async updateTask(id: number, updates: UpdateTaskPayload): Promise<Task> {
    await delay(100);

    const index = taskStore.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const existing = taskStore[index];
    const now = new Date().toISOString();

    const newStatus = updates.status ?? existing.status;
    const isNowDone = newStatus === 'done';
    const wasDone = existing.status === 'done';

    let completedAt = existing.completedAt;
    if (isNowDone && !wasDone) {
      completedAt = now;
    } else if (!isNowDone && wasDone) {
      completedAt = null;
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      status: newStatus,
      completedAt,
      updatedAt: now,
    };

    taskStore = taskStore.map((t) => (t.id === id ? updatedTask : t));
    return { ...updatedTask };
  },

  /**
   * Delete a task by ID.
   */
  async deleteTask(id: number): Promise<{ success: boolean; id: number }> {
    await delay(80);

    const index = taskStore.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    taskStore = taskStore.filter((t) => t.id !== id);
    return { success: true, id };
  },

  /**
   * Get summary counts for dashboard cards.
   */
  async getTaskSummary(): Promise<TaskSummary> {
    await delay(50);

    return {
      totalTasks: taskStore.length,
      pendingTasks: taskStore.filter((t) => t.status === 'backlog').length,
      inProgressTasks: taskStore.filter((t) => t.status === 'in-progress').length,
      completedTasks: taskStore.filter((t) => t.status === 'done').length,
      highPriorityTasks: taskStore.filter((t) => t.priority === 'high').length,
    };
  },

  /**
   * Get all users (for assignee dropdowns).
   */
  async getUsers() {
    await delay(30);
    return [...usersRef];
  },
};
