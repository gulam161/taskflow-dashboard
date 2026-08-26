import { create } from 'zustand';
import type {
  Task,
  User,
  Sprint,
  Comment,
  TaskStatus,
  TaskPriority,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '@/types/board';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import type { InitialBoardData } from '../api/board-service';

interface PersistedBoardData {
  tasks: Task[];
  comments: Comment[];
  users: User[];
  sprints: Sprint[];
}

export interface BoardState {
  // Domain state
  tasks: Task[];
  users: User[];
  sprints: Sprint[];
  comments: Comment[];
  isHydrated: boolean;

  // Filter & Search state
  filterPriority: TaskPriority | 'all';
  filterAssigneeId: number | 'all';
  searchQuery: string;

  // UI modal / drawer state
  selectedTaskId: number | null;
  taskToDelete: Task | null;
  isAddTaskModalOpen: boolean;
  addTaskDefaultStatus: TaskStatus;

  // Undo state
  lastMoveSnapshot: Task[] | null;

  // Actions
  initializeFromData: (data: InitialBoardData) => void;
  moveTask: (activeTaskId: number, destinationStatus: TaskStatus, targetIndex?: number) => void;
  addTask: (payload: CreateTaskPayload) => Task;
  updateTask: (taskId: number, updates: UpdateTaskPayload) => void;
  deleteTask: (taskId: number) => void;
  addComment: (taskId: number, authorId: number, message: string) => Comment;
  undoLastMove: () => void;

  // UI state setters
  setSelectedTaskId: (id: number | null) => void;
  setTaskToDelete: (task: Task | null) => void;
  setIsAddTaskModalOpen: (isOpen: boolean, defaultStatus?: TaskStatus) => void;
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  setFilterAssigneeId: (assigneeId: number | 'all') => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  resetBoardToDefault: (data: InitialBoardData) => void;
}

/** Helper to persist board state */
function persistBoard(state: { tasks: Task[]; comments: Comment[]; users: User[]; sprints: Sprint[] }) {
  storage.set<PersistedBoardData>(STORAGE_KEYS.BOARD_STATE, {
    tasks: state.tasks,
    comments: state.comments,
    users: state.users,
    sprints: state.sprints,
  });
}

export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  users: [],
  sprints: [],
  comments: [],
  isHydrated: false,

  filterPriority: 'all',
  filterAssigneeId: 'all',
  searchQuery: '',

  selectedTaskId: null,
  taskToDelete: null,
  isAddTaskModalOpen: false,
  addTaskDefaultStatus: 'backlog',

  lastMoveSnapshot: null,

  initializeFromData: (data) => {
    // Check if there is existing state persisted in storage
    const persisted = storage.get<PersistedBoardData>(STORAGE_KEYS.BOARD_STATE);

    if (persisted && persisted.tasks && persisted.tasks.length > 0) {
      set({
        tasks: persisted.tasks,
        users: persisted.users?.length ? persisted.users : data.users,
        sprints: persisted.sprints?.length ? persisted.sprints : data.sprints,
        comments: persisted.comments || data.comments,
        isHydrated: true,
      });
      return;
    }

    // Otherwise, initialize from server/mock data (first 30 tasks)
    set({
      tasks: data.tasks,
      users: data.users,
      sprints: data.sprints,
      comments: data.comments,
      isHydrated: true,
    });

    persistBoard({
      tasks: data.tasks,
      comments: data.comments,
      users: data.users,
      sprints: data.sprints,
    });
  },

  moveTask: (activeTaskId, destinationStatus, targetIndex) => {
    const currentTasks = get().tasks;
    const activeTask = currentTasks.find((t) => t.id === activeTaskId);

    if (!activeTask) return;

    // Save snapshot for Undo functionality
    const snapshot = JSON.parse(JSON.stringify(currentTasks)) as Task[];

    const now = new Date().toISOString();
    const isStatusChanged = activeTask.status !== destinationStatus;

    // Filter out the active task from list
    const remainingTasks = currentTasks.filter((t) => t.id !== activeTaskId);

    // Get tasks in destination column
    const destinationTasks = remainingTasks.filter((t) => t.status === destinationStatus);

    // Prepare updated active task
    const updatedActiveTask: Task = {
      ...activeTask,
      status: destinationStatus,
      updatedAt: now,
      completedAt:
        destinationStatus === 'done'
          ? activeTask.completedAt || now
          : isStatusChanged
          ? null
          : activeTask.completedAt,
    };

    // Calculate insertion index
    let insertAt = destinationTasks.length;
    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= destinationTasks.length) {
      insertAt = targetIndex;
    }

    // Insert active task into destination column tasks
    destinationTasks.splice(insertAt, 0, updatedActiveTask);

    // Reassign order within destination column
    destinationTasks.forEach((task, idx) => {
      task.order = idx + 1;
    });

    // Reconstruct all tasks preserving orders
    const nonDestinationTasks = remainingTasks.filter((t) => t.status !== destinationStatus);
    const newTasks = [...nonDestinationTasks, ...destinationTasks];

    set({
      tasks: newTasks,
      lastMoveSnapshot: snapshot,
    });

    persistBoard({
      tasks: newTasks,
      comments: get().comments,
      users: get().users,
      sprints: get().sprints,
    });
  },

  addTask: (payload) => {
    const { tasks, comments, users, sprints } = get();

    // Determine new unique ID
    const maxId = tasks.reduce((max, t) => Math.max(max, t.id), 0);
    const newId = maxId + 1;

    // Determine order in destination column
    const columnTasks = tasks.filter((t) => t.status === payload.status);
    const newOrder = columnTasks.length + 1;

    const now = new Date().toISOString();

    const newTask: Task = {
      id: newId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      status: payload.status,
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate,
      sprintId: payload.sprintId || 3,
      order: newOrder,
      createdAt: now,
      completedAt: payload.status === 'done' ? now : null,
      updatedAt: now,
    };

    const newTasks = [...tasks, newTask];

    set({
      tasks: newTasks,
      isAddTaskModalOpen: false,
    });

    persistBoard({
      tasks: newTasks,
      comments,
      users,
      sprints,
    });

    return newTask;
  },

  updateTask: (taskId, updates) => {
    const { tasks, comments, users, sprints } = get();
    const now = new Date().toISOString();

    const newTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;

      const newStatus = updates.status ?? task.status;
      const isNowDone = newStatus === 'done';
      const wasDone = task.status === 'done';

      let completedAt = task.completedAt;
      if (isNowDone && !wasDone) {
        completedAt = now;
      } else if (!isNowDone && wasDone) {
        completedAt = null;
      }

      return {
        ...task,
        ...updates,
        title: updates.title !== undefined ? updates.title.trim() : task.title,
        description: updates.description !== undefined ? updates.description.trim() : task.description,
        status: newStatus,
        completedAt,
        updatedAt: now,
      };
    });

    set({ tasks: newTasks });

    persistBoard({
      tasks: newTasks,
      comments,
      users,
      sprints,
    });
  },

  deleteTask: (taskId) => {
    const { tasks, comments, users, sprints, selectedTaskId } = get();

    const newTasks = tasks.filter((t) => t.id !== taskId);
    const newComments = comments.filter((c) => c.taskId !== taskId);

    set({
      tasks: newTasks,
      comments: newComments,
      taskToDelete: null,
      selectedTaskId: selectedTaskId === taskId ? null : selectedTaskId,
    });

    persistBoard({
      tasks: newTasks,
      comments: newComments,
      users,
      sprints,
    });
  },

  addComment: (taskId, authorId, message) => {
    const { tasks, comments, users, sprints } = get();

    const maxId = comments.reduce((max, c) => Math.max(max, c.id), 0);
    const newComment: Comment = {
      id: maxId + 1,
      taskId,
      authorId,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const newComments = [...comments, newComment];

    set({ comments: newComments });

    persistBoard({
      tasks,
      comments: newComments,
      users,
      sprints,
    });

    return newComment;
  },

  undoLastMove: () => {
    const { lastMoveSnapshot, comments, users, sprints } = get();
    if (!lastMoveSnapshot) return;

    set({
      tasks: lastMoveSnapshot,
      lastMoveSnapshot: null,
    });

    persistBoard({
      tasks: lastMoveSnapshot,
      comments,
      users,
      sprints,
    });
  },

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setTaskToDelete: (task) => set({ taskToDelete: task }),
  setIsAddTaskModalOpen: (isOpen, defaultStatus = 'backlog') =>
    set({ isAddTaskModalOpen: isOpen, addTaskDefaultStatus: defaultStatus }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterAssigneeId: (assigneeId) => set({ filterAssigneeId: assigneeId }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () =>
    set({
      filterPriority: 'all',
      filterAssigneeId: 'all',
      searchQuery: '',
    }),

  resetBoardToDefault: (data) => {
    set({
      tasks: data.tasks,
      users: data.users,
      sprints: data.sprints,
      comments: data.comments,
      lastMoveSnapshot: null,
      selectedTaskId: null,
      taskToDelete: null,
      isAddTaskModalOpen: false,
      filterPriority: 'all',
      filterAssigneeId: 'all',
      searchQuery: '',
    });

    persistBoard({
      tasks: data.tasks,
      comments: data.comments,
      users: data.users,
      sprints: data.sprints,
    });
  },
}));
