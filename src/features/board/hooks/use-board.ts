import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { boardService, type InitialBoardData } from '../api/board-service';
import { useBoardStore } from '../store/board-store';
import type { Task, TaskStatus, User } from '@/types/board';

export function useBoard() {
  const {
    tasks,
    users,
    sprints,
    comments,
    isHydrated,
    filterPriority,
    filterAssigneeId,
    searchQuery,
    selectedTaskId,
    taskToDelete,
    isAddTaskModalOpen,
    addTaskDefaultStatus,
    lastMoveSnapshot,
    initializeFromData,
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
  } = useBoardStore();

  // TanStack Query for server-state fetching & caching
  const {
    data: serverData,
    isLoading: isServerLoading,
    isError,
    error,
    refetch,
  } = useQuery<InitialBoardData, Error>({
    queryKey: ['board-initial-data'],
    queryFn: () => boardService.fetchInitialData(),
    staleTime: Infinity, // Keep cached; Zustand manages runtime mutations & persistence
  });

  // Sync fetched initial data into Zustand once loaded
  useEffect(() => {
    if (serverData && !isHydrated) {
      initializeFromData(serverData);
    }
  }, [serverData, isHydrated, initializeFromData]);

  // Lookup map for fast user resolution by ID
  const usersMap = useMemo<Record<number, User>>(() => {
    const map: Record<number, User> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Comment count lookup map by Task ID
  const commentCounts = useMemo<Record<number, number>>(() => {
    const counts: Record<number, number> = {};
    comments.forEach((c) => {
      counts[c.taskId] = (counts[c.taskId] || 0) + 1;
    });
    return counts;
  }, [comments]);

  // Filter tasks based on priority, assignee, and search query
  const filteredTasks = useMemo<Task[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      // Assignee filter
      if (filterAssigneeId !== 'all' && task.assigneeId !== filterAssigneeId) {
        return false;
      }

      // Search query filter (title or description)
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }, [tasks, filterPriority, filterAssigneeId, searchQuery]);

  // Group filtered tasks by the four Kanban columns in sorted order
  const columnTasks = useMemo<Record<TaskStatus, Task[]>>(() => {
    const columns: Record<TaskStatus, Task[]> = {
      'backlog': [],
      'in-progress': [],
      'review': [],
      'done': [],
    };

    filteredTasks.forEach((task) => {
      if (columns[task.status]) {
        columns[task.status].push(task);
      }
    });

    // Sort tasks in each column by order
    (Object.keys(columns) as TaskStatus[]).forEach((col) => {
      columns[col].sort((a, b) => a.order - b.order);
    });

    return columns;
  }, [filteredTasks]);

  // Currently selected task for the detail drawer
  const selectedTask = useMemo<Task | null>(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Comments for currently selected task
  const selectedTaskComments = useMemo(() => {
    if (!selectedTaskId) return [];
    return comments
      .filter((c) => c.taskId === selectedTaskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [comments, selectedTaskId]);

  return {
    // Data
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    columnTasks,
    users,
    usersMap,
    sprints,
    commentCounts,
    selectedTask,
    selectedTaskComments,
    taskToDelete,
    isAddTaskModalOpen,
    addTaskDefaultStatus,
    canUndo: Boolean(lastMoveSnapshot),

    // Loading & Error States
    isLoading: isServerLoading && !isHydrated,
    isError,
    error,
    refetch,

    // Filter states
    filterPriority,
    filterAssigneeId,
    searchQuery,

    // Actions
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
  };
}
