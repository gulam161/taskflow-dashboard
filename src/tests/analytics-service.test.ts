import { describe, it, expect } from 'vitest';
import {
  computeSprintVelocity,
  computeStatusDistribution,
  computePriorityBreakdown,
  computeCompletionTrend,
  computeKpiSummary,
} from '@/features/analytics/api/analytics-service';
import type { Task, Sprint } from '@/types/board';

const mockSprints: Sprint[] = [
  { id: 1, name: 'Sprint 1', startDate: '2026-07-20', endDate: '2026-07-31' },
  { id: 2, name: 'Sprint 2', startDate: '2026-08-03', endDate: '2026-08-14' },
  { id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' },
];

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Desc 1',
    status: 'done',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-10',
    sprintId: 1,
    order: 1,
    createdAt: '2026-07-21T09:00:00Z',
    completedAt: '2026-07-25T15:00:00Z',
    updatedAt: '2026-07-25T15:00:00Z',
  },
  {
    id: 2,
    title: 'Task 2',
    description: 'Desc 2',
    status: 'done',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-07-30',
    sprintId: 1,
    order: 2,
    createdAt: '2026-07-22T09:00:00Z',
    completedAt: '2026-07-28T11:00:00Z',
    updatedAt: '2026-07-28T11:00:00Z',
  },
  {
    id: 3,
    title: 'Task 3',
    description: 'Desc 3',
    status: 'in-progress',
    priority: 'low',
    assigneeId: 1,
    dueDate: '2026-08-12',
    sprintId: 2,
    order: 1,
    createdAt: '2026-08-04T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 4,
    title: 'Task 4',
    description: 'Desc 4',
    status: 'done',
    priority: 'high',
    assigneeId: 3,
    dueDate: '2026-08-14',
    sprintId: 2,
    order: 2,
    createdAt: '2026-08-05T09:00:00Z',
    completedAt: '2026-08-14T17:00:00Z',
    updatedAt: '2026-08-14T17:00:00Z',
  },
  {
    id: 5,
    title: 'Task 5',
    description: 'Desc 5',
    status: 'review',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-08-25',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-18T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-18T09:00:00Z',
  },
  {
    id: 6,
    title: 'Task 6',
    description: 'Desc 6',
    status: 'backlog',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-27',
    sprintId: 3,
    order: 2,
    createdAt: '2026-08-19T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-19T09:00:00Z',
  },
];

describe('analytics-service', () => {
  it('computeSprintVelocity derives velocity accurately from actual sprint data', () => {
    const velocity = computeSprintVelocity(mockTasks, mockSprints);

    expect(velocity).toHaveLength(3);
    expect(velocity[0]).toEqual({
      sprintId: 1,
      sprintName: 'Sprint 1',
      completed: 2,
      total: 2,
    });
    expect(velocity[1]).toEqual({
      sprintId: 2,
      sprintName: 'Sprint 2',
      completed: 1,
      total: 2,
    });
    expect(velocity[2]).toEqual({
      sprintId: 3,
      sprintName: 'Sprint 3',
      completed: 0,
      total: 2,
    });
  });

  it('computeStatusDistribution accurately groups counts across the 4 kanban columns', () => {
    const distribution = computeStatusDistribution(mockTasks);

    expect(distribution).toHaveLength(4);
    const backlog = distribution.find((d) => d.status === 'backlog');
    const inProgress = distribution.find((d) => d.status === 'in-progress');
    const review = distribution.find((d) => d.status === 'review');
    const done = distribution.find((d) => d.status === 'done');

    expect(backlog?.count).toBe(1);
    expect(inProgress?.count).toBe(1);
    expect(review?.count).toBe(1);
    expect(done?.count).toBe(3);
    expect(done?.percentage).toBe(50); // 3 of 6 = 50%
  });

  it('computePriorityBreakdown computes low, medium, and high priorities per column', () => {
    const breakdown = computePriorityBreakdown(mockTasks);

    expect(breakdown).toHaveLength(4);

    const doneCol = breakdown.find((b) => b.status === 'done');
    expect(doneCol?.high).toBe(2);
    expect(doneCol?.medium).toBe(1);
    expect(doneCol?.low).toBe(0);

    const backlogCol = breakdown.find((b) => b.status === 'backlog');
    expect(backlogCol?.high).toBe(1);
    expect(backlogCol?.medium).toBe(0);
    expect(backlogCol?.low).toBe(0);
  });

  it('computeCompletionTrend uses real completedAt timestamps and orders chronologically', () => {
    const trend = computeCompletionTrend(mockTasks);

    expect(trend).toHaveLength(3); // 3 distinct completion dates
    expect(trend[0].date).toBe('2026-07-25');
    expect(trend[0].completed).toBe(1);

    expect(trend[1].date).toBe('2026-07-28');
    expect(trend[1].completed).toBe(2);

    expect(trend[2].date).toBe('2026-08-14');
    expect(trend[2].completed).toBe(3);
  });

  it('computeCompletionTrend handles empty list gracefully', () => {
    const trend = computeCompletionTrend([]);
    expect(trend).toEqual([]);
  });

  it('computeKpiSummary calculates overall summary metrics correctly', () => {
    const summary = computeKpiSummary(mockTasks, mockSprints);

    expect(summary.totalTasks).toBe(6);
    expect(summary.completedTasks).toBe(3);
    expect(summary.completionRate).toBe(50);
    expect(summary.inProgressTasks).toBe(1);
    expect(summary.reviewTasks).toBe(1);
    expect(summary.backlogTasks).toBe(1);
    // Task 6 is high priority and in backlog (open)
    expect(summary.highPriorityOpen).toBe(1);
    // 3 completed across 3 sprints with work = 1 avg
    expect(summary.avgVelocity).toBe(1);
  });
});
