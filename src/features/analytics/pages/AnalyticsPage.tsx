import { useAnalytics } from "../hooks/use-analytics";
import { SprintVelocityChart } from "../components/SprintVelocityChart";
import { StatusDistributionChart } from "../components/StatusDistributionChart";
import { PriorityBreakdownChart } from "../components/PriorityBreakdownChart";
import { CompletionTrendChart } from "../components/CompletionTrendChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { DashboardSummaryCards } from "@/features/tasks/components/DashboardSummaryCards";

export function AnalyticsPage() {
  const {
    sprintVelocity,
    statusDistribution,
    priorityBreakdown,
    completionTrend,
    isLoading,
    isError,
    error,
  } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton
            variant="text"
            width="200px"
            height="28px"
            className="mb-2"
          />
          <Skeleton variant="text" width="360px" height="18px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="120px" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="340px" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center space-y-4">
        <p className="text-red-700 dark:text-red-300 font-semibold">
          Failed to load analytics: {error?.message || "Unknown error"}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sprint Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time visualizations for sprint velocity, task distribution, and
            completion trends.
          </p>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <DashboardSummaryCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Velocity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Sprint Velocity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Completed vs total tasks per actual sprint
            </p>
          </div>
          <div className="flex-1">
            <SprintVelocityChart data={sprintVelocity} />
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Task Status Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proportion of tasks across the 4 Kanban columns
            </p>
          </div>
          <div className="flex-1">
            <StatusDistributionChart data={statusDistribution} />
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Priority Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stacked distribution of priorities by column status
            </p>
          </div>
          <div className="flex-1">
            <PriorityBreakdownChart data={priorityBreakdown} />
          </div>
        </div>

        {/* Completion Trend */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Completion Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cumulative completed tasks over time from real timestamps
            </p>
          </div>
          <div className="flex-1">
            <CompletionTrendChart data={completionTrend} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
