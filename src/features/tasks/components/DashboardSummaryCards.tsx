import { useQuery } from '@tanstack/react-query';
import { taskService, type TaskSummary } from '../api/task-service';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardSummaryCardsProps {
  summary?: TaskSummary | null;
}

/**
 * 5 Dashboard Summary Cards as required by the Project Management assessment:
 * 1. Total Tasks
 * 2. Pending Tasks
 * 3. In Progress Tasks
 * 4. Completed Tasks
 * 5. High Priority Tasks
 */
export function DashboardSummaryCards({ summary: propSummary }: DashboardSummaryCardsProps) {
  // If summary not passed as prop, fetch via TanStack Query
  const { data: fetchedSummary, isLoading } = useQuery({
    queryKey: ['task-summary'],
    queryFn: () => taskService.getTaskSummary(),
    enabled: !propSummary,
  });

  const summary = propSummary || fetchedSummary;

  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="110px" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Tasks',
      value: summary?.totalTasks ?? 0,
      subtext: 'All workspace tasks',
      icon: (
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50',
      badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-900/60',
    },
    {
      title: 'Pending Tasks',
      value: summary?.pendingTasks ?? 0,
      subtext: 'Awaiting start',
      icon: (
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
      badgeColor: 'text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/60',
    },
    {
      title: 'In Progress Tasks',
      value: summary?.inProgressTasks ?? 0,
      subtext: 'Currently being worked on',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50',
      badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/60',
    },
    {
      title: 'Completed Tasks',
      value: summary?.completedTasks ?? 0,
      subtext: 'Successfully delivered',
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/60',
    },
    {
      title: 'High Priority Tasks',
      value: summary?.highPriorityTasks ?? 0,
      subtext: 'Critical attention required',
      icon: (
        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50',
      badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-900/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`p-5 rounded-2xl border ${card.bg} shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
              {card.icon}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {card.value}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
