import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '@/features/board/store/board-store';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import type { Task, User, Comment, Sprint } from '@/types/board';

const mockUsers: User[] = [
  { id: 1, name: 'Emily Johnson', email: 'emily@example.com', avatar: 'https://img.com/1' },
  { id: 2, name: 'Michael Williams', email: 'michael@example.com', avatar: 'https://img.com/2' },
];

const mockSprints: Sprint[] = [
  { id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' },
];

const mockInitialTasks: Task[] = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Desc 1',
    status: 'backlog',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-25',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T09:30:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T09:30:00Z',
  },
  {
    id: 2,
    title: 'Task 2',
    description: 'Desc 2',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-08-26',
    sprintId: 3,
    order: 2,
    createdAt: '2026-08-15T10:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 3,
    title: 'Task 3',
    description: 'Desc 3',
    status: 'in-progress',
    priority: 'low',
    assigneeId: 1,
    dueDate: '2026-08-27',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T11:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T11:00:00Z',
  },
];

const mockComments: Comment[] = [
  { id: 1, taskId: 1, authorId: 1, message: 'First comment', createdAt: '2026-08-16T10:00:00Z' },
];

describe('Zustand Board Store', () => {
  beforeEach(() => {
    storage.clear();
    useBoardStore.setState({
      tasks: [],
      users: [],
      sprints: [],
      comments: [],
      isHydrated: false,
      lastMoveSnapshot: null,
      selectedTaskId: null,
      taskToDelete: null,
      filterPriority: 'all',
      filterAssigneeId: 'all',
      searchQuery: '',
    });
  });

  it('should initialize board data and persist to storage', () => {
    const store = useBoardStore.getState();

    store.initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(3);
    expect(state.users).toHaveLength(2);
    expect(state.isHydrated).toBe(true);

    // Verify localStorage persistence
    const persisted = storage.get<{ tasks: Task[] }>(STORAGE_KEYS.BOARD_STATE);
    expect(persisted).not.toBeNull();
    expect(persisted?.tasks).toHaveLength(3);
  });

  it('should add a new task with unique ID and proper order in column', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    const newTask = useBoardStore.getState().addTask({
      title: 'New Feature Task',
      description: 'Task description here',
      status: 'in-progress',
      priority: 'high',
      assigneeId: 2,
      dueDate: '2026-08-30',
      sprintId: 3,
    });

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(4);
    expect(newTask.id).toBe(4);
    expect(newTask.title).toBe('New Feature Task');
    expect(newTask.status).toBe('in-progress');
    // Order in in-progress should be 2 (since Task 3 is order 1)
    expect(newTask.order).toBe(2);

    // Verify persisted
    const persisted = storage.get<{ tasks: Task[] }>(STORAGE_KEYS.BOARD_STATE);
    expect(persisted?.tasks).toHaveLength(4);
  });

  it('should move a task between columns and update status & completedAt', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    // Move Task 1 from backlog to done
    useBoardStore.getState().moveTask(1, 'done');

    const state = useBoardStore.getState();
    const movedTask = state.tasks.find((t) => t.id === 1);

    expect(movedTask?.status).toBe('done');
    expect(movedTask?.completedAt).not.toBeNull();
    expect(state.lastMoveSnapshot).not.toBeNull();

    // Verify persisted
    const persisted = storage.get<{ tasks: Task[] }>(STORAGE_KEYS.BOARD_STATE);
    const persistedTask = persisted?.tasks.find((t) => t.id === 1);
    expect(persistedTask?.status).toBe('done');
  });

  it('should reorder tasks within the same column', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    // In backlog: Task 1 (order 1), Task 2 (order 2)
    // Move Task 2 to index 0 (top of backlog)
    useBoardStore.getState().moveTask(2, 'backlog', 0);

    const state = useBoardStore.getState();
    const task2 = state.tasks.find((t) => t.id === 2);
    const task1 = state.tasks.find((t) => t.id === 1);

    expect(task2?.order).toBe(1);
    expect(task1?.order).toBe(2);
  });

  it('should update task details in place', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    useBoardStore.getState().updateTask(1, {
      title: 'Updated Task 1 Title',
      priority: 'low',
    });

    const updated = useBoardStore.getState().tasks.find((t) => t.id === 1);
    expect(updated?.title).toBe('Updated Task 1 Title');
    expect(updated?.priority).toBe('low');
  });

  it('should delete a task and its associated comments', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    useBoardStore.getState().setSelectedTaskId(1);
    useBoardStore.getState().deleteTask(1);

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks.find((t) => t.id === 1)).toBeUndefined();
    expect(state.comments.filter((c) => c.taskId === 1)).toHaveLength(0);
    expect(state.selectedTaskId).toBeNull();
  });

  it('should add a comment to a task', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    const comment = useBoardStore.getState().addComment(2, 1, 'Brand new comment message');

    const state = useBoardStore.getState();
    expect(state.comments).toHaveLength(2);
    expect(comment.id).toBe(2);
    expect(comment.taskId).toBe(2);
    expect(comment.message).toBe('Brand new comment message');
  });

  it('should undo the last drag-and-drop move', () => {
    useBoardStore.getState().initializeFromData({
      tasks: mockInitialTasks,
      users: mockUsers,
      sprints: mockSprints,
      comments: mockComments,
    });

    // Move Task 1 to done
    useBoardStore.getState().moveTask(1, 'done');
    expect(useBoardStore.getState().tasks.find((t) => t.id === 1)?.status).toBe('done');

    // Trigger Undo
    useBoardStore.getState().undoLastMove();

    const state = useBoardStore.getState();
    expect(state.tasks.find((t) => t.id === 1)?.status).toBe('backlog');
    expect(state.lastMoveSnapshot).toBeNull();
  });

  it('should handle search and filter state setters', () => {
    const store = useBoardStore.getState();

    store.setFilterPriority('high');
    store.setFilterAssigneeId(2);
    store.setSearchQuery('auth');

    let state = useBoardStore.getState();
    expect(state.filterPriority).toBe('high');
    expect(state.filterAssigneeId).toBe(2);
    expect(state.searchQuery).toBe('auth');

    store.resetFilters();

    state = useBoardStore.getState();
    expect(state.filterPriority).toBe('all');
    expect(state.filterAssigneeId).toBe('all');
    expect(state.searchQuery).toBe('');
  });
});
