import type { Task, Sprint, TaskStatus, TaskPriority } from '@/types/board';
import { KANBAN_COLUMNS, TASK_PRIORITIES } from '@/utils/constants';

// ────────────────────────────────────────────────────────────────────────────
// Analytics result types
// ────────────────────────────────────────────────────────────────────────────

export interface SprintVelocityEntry {
  sprintId: number;
  sprintName: string;
  completed: number;
  total: number;
}

export interface StatusDistributionEntry {
  status: TaskStatus;
  label: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface PriorityBreakdownEntry {
  status: TaskStatus;
  label: string;
  low: number;
  medium: number;
  high: number;
}

export interface CompletionTrendEntry {
  date: string;
  label: string;
  completed: number;
}

export interface KpiSummary {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  inProgressTasks: number;
  reviewTasks: number;
  backlogTasks: number;
  highPriorityOpen: number;
  avgVelocity: number;
  overdueTasks: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Status → chart color mapping
// ────────────────────────────────────────────────────────────────────────────

const STATUS_CHART_COLORS: Record<TaskStatus, string> = {
  backlog: '#94a3b8',
  'in-progress': '#3b82f6',
  review: '#f59e0b',
  done: '#22c55e',
};

// ────────────────────────────────────────────────────────────────────────────
// Service functions — pure derivations, no side-effects
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute sprint velocity from actual sprint data.
 * For each sprint, counts how many tasks have `status === 'done'`
 * AND belong to that sprint via `sprintId`.
 */
export function computeSprintVelocity(
  tasks: Task[],
  sprints: Sprint[]
): SprintVelocityEntry[] {
  return sprints
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
      const completed = sprintTasks.filter((t) => t.status === 'done').length;
      return {
        sprintId: sprint.id,
        sprintName: sprint.name,
        completed,
        total: sprintTasks.length,
      };
    });
}

/**
 * Compute task distribution across the four Kanban columns.
 */
export function computeStatusDistribution(tasks: Task[]): StatusDistributionEntry[] {
  const total = tasks.length || 1; // avoid ÷0

  return KANBAN_COLUMNS.map((col) => {
    const count = tasks.filter((t) => t.status === col.id).length;
    return {
      status: col.id,
      label: col.title,
      count,
      percentage: Math.round((count / total) * 100),
      fill: STATUS_CHART_COLORS[col.id],
    };
  });
}

/**
 * Compute priority breakdown per column status.
 */
export function computePriorityBreakdown(tasks: Task[]): PriorityBreakdownEntry[] {
  return KANBAN_COLUMNS.map((col) => {
    const colTasks = tasks.filter((t) => t.status === col.id);

    const counts: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0 };
    for (const t of colTasks) {
      if (TASK_PRIORITIES.includes(t.priority as typeof TASK_PRIORITIES[number])) {
        counts[t.priority]++;
      }
    }

    return {
      status: col.id,
      label: col.title,
      ...counts,
    };
  });
}

/**
 * Compute completion trend using real `completedAt` timestamps.
 * Groups completed tasks by calendar day and returns cumulative counts.
 */
export function computeCompletionTrend(tasks: Task[]): CompletionTrendEntry[] {
  // Collect all tasks with a real completedAt timestamp
  const completedTasks = tasks
    .filter((t): t is Task & { completedAt: string } => t.completedAt !== null)
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

  if (completedTasks.length === 0) return [];

  // Group by date string (YYYY-MM-DD)
  const countsByDate = new Map<string, number>();
  for (const t of completedTasks) {
    const dayKey = new Date(t.completedAt).toISOString().split('T')[0];
    countsByDate.set(dayKey, (countsByDate.get(dayKey) || 0) + 1);
  }

  // Convert to cumulative trend array sorted chronologically
  const sortedDays = Array.from(countsByDate.entries()).sort(
    (a, b) => a[0].localeCompare(b[0])
  );

  let cumulative = 0;
  return sortedDays.map(([date, count]) => {
    cumulative += count;
    const d = new Date(date);
    const label = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return { date, label, completed: cumulative };
  });
}

/**
 * Compute KPI summary metrics.
 */
export function computeKpiSummary(
  tasks: Task[],
  sprints: Sprint[]
): KpiSummary {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const backlog = tasks.filter((t) => t.status === 'backlog').length;
  const highPriorityOpen = tasks.filter(
    (t) => t.priority === 'high' && t.status !== 'done'
  ).length;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && new Date(t.dueDate) < today
  ).length;

  // Average velocity: completed per sprint (from actual sprint data)
  const velocity = computeSprintVelocity(tasks, sprints);
  const sprintsWithWork = velocity.filter((v) => v.total > 0);
  const avgVelocity =
    sprintsWithWork.length > 0
      ? Math.round(
          sprintsWithWork.reduce((s, v) => s + v.completed, 0) /
            sprintsWithWork.length
        )
      : 0;

  return {
    totalTasks: total,
    completedTasks: completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    inProgressTasks: inProgress,
    reviewTasks: review,
    backlogTasks: backlog,
    highPriorityOpen,
    avgVelocity,
    overdueTasks: overdue,
  };
}
