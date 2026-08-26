import type { NotificationType, TaskPriority, TaskStatus } from './common';
export type { NotificationType, TaskPriority, TaskStatus } from './common';

/** Represents a user/team member */
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

/** Represents a sprint period */
export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

/** Represents a task on the board */
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  sprintId: number;
  order: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

/** Represents a comment on a task */
export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string;
}

/** Represents a notification item from mock data */
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

/** The complete mock-data.json structure */
export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: AppNotification[];
}

/** Data for creating a new task */
export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  status: TaskStatus;
  sprintId: number;
}

/** Data for updating a task */
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: string;
  status?: TaskStatus;
}
