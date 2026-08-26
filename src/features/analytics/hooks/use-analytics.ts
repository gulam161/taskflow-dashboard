import { useMemo } from 'react';
import { useBoardStore } from '@/features/board/store/board-store';
import { useBoard } from '@/features/board/hooks/use-board';
import {
  computeSprintVelocity,
  computeStatusDistribution,
  computePriorityBreakdown,
  computeCompletionTrend,
  computeKpiSummary,
} from '../api/analytics-service';

/**
 * Custom hook that reactively computes all analytics metrics
 * directly from the Zustand board store while ensuring
 * server-state hydration via TanStack Query.
 *
 * Any board mutation (add/move/update/delete) automatically
 * recomputes all derived chart data.
 */
export function useAnalytics() {
  // Trigger board query hydration if not already hydrated
  const { isLoading, isError, error } = useBoard();

  // Read raw (unfiltered) tasks and sprints directly from Zustand store
  const tasks = useBoardStore((s) => s.tasks);
  const sprints = useBoardStore((s) => s.sprints);
  const isHydrated = useBoardStore((s) => s.isHydrated);

  const sprintVelocity = useMemo(
    () => computeSprintVelocity(tasks, sprints),
    [tasks, sprints]
  );

  const statusDistribution = useMemo(
    () => computeStatusDistribution(tasks),
    [tasks]
  );

  const priorityBreakdown = useMemo(
    () => computePriorityBreakdown(tasks),
    [tasks]
  );

  const completionTrend = useMemo(
    () => computeCompletionTrend(tasks),
    [tasks]
  );

  const kpiSummary = useMemo(
    () => computeKpiSummary(tasks, sprints),
    [tasks, sprints]
  );

  return {
    sprintVelocity,
    statusDistribution,
    priorityBreakdown,
    completionTrend,
    kpiSummary,
    isLoading,
    isError,
    error,
    isReady: isHydrated,
  };
}
