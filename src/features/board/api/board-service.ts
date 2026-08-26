import mockDataRaw from '../../../../mock-data.json';
import type { MockData, Task, User, Sprint, Comment } from '@/types/board';
import { INITIAL_TASK_LIMIT } from '@/utils/constants';

export interface InitialBoardData {
  tasks: Task[];
  users: User[];
  sprints: Sprint[];
  comments: Comment[];
}

/**
 * Board service layer.
 * Organizes data access for sprint tasks, users, sprints, and comments.
 */
export const boardService = {
  /**
   * Fetches the initial mock data representing backend responses.
   * Requirement: Exactly the first 30 tasks from mock-data.json.
   * Users, sprints, and comments are fully loaded for relationships/details.
   */
  async fetchInitialData(): Promise<InitialBoardData> {
    // Cast imported raw mock data
    const rawData = mockDataRaw as unknown as MockData;

    // Simulate minor network latency for realistic server-state lifecycle
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Slice exactly the first 30 tasks as required
    const tasks = (rawData.tasks || []).slice(0, INITIAL_TASK_LIMIT);
    const users = rawData.users || [];
    const sprints = rawData.sprints || [];
    const comments = rawData.comments || [];

    return {
      tasks,
      users,
      sprints,
      comments,
    };
  },
};
