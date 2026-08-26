import { Link } from "react-router-dom";
import { useAnalytics } from "@/features/analytics/hooks/use-analytics";
import { useBoard } from "@/features/board/hooks/use-board";
import { DashboardSummaryCards } from "@/features/tasks/components/DashboardSummaryCards";
import { StatusDistributionChart } from "@/features/analytics/components/StatusDistributionChart";
import { TaskDrawer } from "@/features/board/components/TaskDrawer";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/utils/constants";
import { formatDate, isOverdue } from "@/utils/date";
import type { Task } from "@/types/board";

export function DashboardPage() {
  const { statusDistribution, isLoading, isError, error } = useAnalytics();
  const {
    tasks,
    users,
    usersMap,
    sprints,
    selectedTask,
    selectedTaskComments,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    addComment,
    setTaskToDelete,
  } = useBoard();

  // Find active sprint (or default to the latest sprint)
  const activeSprint = sprints.length > 0 ? sprints[sprints.length - 1] : null;

  // Active sprint tasks
  const sprintTasks = activeSprint
    ? tasks.filter((t) => t.sprintId === activeSprint.id)
    : tasks;

  const sprintCompleted = sprintTasks.filter((t) => t.status === "done").length;
  const sprintTotal = sprintTasks.length || 1;
  const sprintProgress = Math.round((sprintCompleted / sprintTotal) * 100);

  // Table columns for Recent / Critical Tasks
  const taskColumns: Column<Task>[] = [
    {
      key: "title",
      header: "Task Title",
      render: (task) => (
        <button
          type="button"
          onClick={() => setSelectedTaskId(task.id)}
          className="text-left font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
        >
          {task.title}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${STATUS_COLORS[task.status] || "bg-slate-400"}`}
          />
          {task.status.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => {
        const pStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${pStyle.bg} ${pStyle.text}`}
          >
            {task.priority}
          </span>
        );
      },
    },
    {
      key: "assigneeId",
      header: "Assignee",
      render: (task) => {
        const user = usersMap[task.assigneeId];
        if (!user)
          return <span className="text-xs text-slate-400">Unassigned</span>;
        return (
          <div className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {user.name}
            </span>
          </div>
        );
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (task) => {
        const overdue = task.status !== "done" && isOverdue(task.dueDate);
        return (
          <span
            className={`text-xs font-medium ${
              overdue
                ? "text-red-600 dark:text-red-400 font-semibold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {formatDate(task.dueDate)}
            {overdue && " (Overdue)"}
          </span>
        );
      },
    },
  ];

  // Recent/High priority active tasks (first 6)
  const priorityTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton
            variant="text"
            width="220px"
            height="28px"
            className="mb-2"
          />
          <Skeleton variant="text" width="380px" height="18px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="120px" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton
            variant="rectangular"
            height="300px"
            className="lg:col-span-2"
          />
          <Skeleton variant="rectangular" height="300px" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center space-y-4">
        <p className="text-red-700 dark:text-red-300 font-semibold">
          Failed to load dashboard: {error?.message || "Unknown error"}
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
            Sprint Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active sprint health, team velocity, and critical open tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tasks">
            <Button
              variant="outline"
              size="md"
              leftIcon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            >
              Task Management
            </Button>
          </Link>
          <Link to="/board">
            <Button variant="primary" size="md">
              Go to Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Assessment Requirement: 5 Dashboard Summary Cards */}
      <DashboardSummaryCards />

      {/* Middle Section: Active Sprint Progress + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sprint Summary Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Active Sprint
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeSprint ? activeSprint.name : "Current Sprint"}
                </h2>
              </div>
              <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                {sprintProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${sprintProgress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {sprintCompleted} of {sprintTasks.length} tasks completed
              </span>
              {activeSprint && (
                <span>
                  {formatDate(activeSprint.startDate)} –{" "}
                  {formatDate(activeSprint.endDate)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">Backlog</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                {sprintTasks.filter((t) => t.status === "backlog").length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">In Progress</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {sprintTasks.filter((t) => t.status === "in-progress").length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Review</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {sprintTasks.filter((t) => t.status === "review").length}
              </p>
            </div>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Status Breakdown
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <StatusDistributionChart data={statusDistribution} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Critical & High Priority Tasks using DataTable */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Actionable Tasks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High priority and upcoming items requiring attention
            </p>
          </div>
          <Link to="/board">
            <Button variant="ghost" size="sm">
              View All Tasks &rarr;
            </Button>
          </Link>
        </div>

        <DataTable<Task>
          columns={taskColumns}
          data={priorityTasks}
          rowKey={(task) => task.id}
          emptyMessage="No pending high-priority tasks. Great job!"
          striped
        />
      </div>

      {/* Task Details Side Drawer */}
      <TaskDrawer
        task={selectedTask}
        users={users}
        usersMap={usersMap}
        comments={selectedTaskComments}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={updateTask}
        onDelete={(task) => {
          setTaskToDelete(task);
          deleteTask(task.id);
        }}
        onAddComment={addComment}
      />
    </div>
  );
}

export default DashboardPage;
