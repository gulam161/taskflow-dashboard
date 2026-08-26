import { useState, useEffect, type FormEvent } from 'react';
import type { Task, User, Comment, TaskStatus, TaskPriority } from '@/types/board';
import { KANBAN_COLUMNS, TASK_PRIORITIES } from '@/utils/constants';
import { formatRelativeTime, formatDate } from '@/utils/date';
import { Button } from '@/components/ui/Button';

interface TaskDrawerProps {
  task: Task | null;
  users: User[];
  usersMap: Record<number, User>;
  comments: Comment[];
  onClose: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
  onDelete: (task: Task) => void;
  onAddComment: (taskId: number, authorId: number, message: string) => void;
  currentUserId?: number;
}

interface DrawerContentProps {
  task: Task;
  users: User[];
  usersMap: Record<number, User>;
  comments: Comment[];
  onClose: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
  onDelete: (task: Task) => void;
  onAddComment: (taskId: number, authorId: number, message: string) => void;
  currentUserId: number;
}

function TaskDrawerContent({
  task,
  users,
  usersMap,
  comments,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  currentUserId,
}: DrawerContentProps) {
  // State initialized naturally from task prop on mount
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [newComment, setNewComment] = useState('');

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdate(task.id, { description: description.trim() });
    }
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment(task.id, currentUserId, newComment.trim());
    setNewComment('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in-right"
      >
        {/* Drawer Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              SD-{task.id}
            </span>
            <span className="text-xs text-slate-400">Task Details</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label="Delete this task"
              title="Delete task"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details drawer"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Editable Title */}
          <div>
            <label htmlFor="drawer-title" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Title
            </label>
            <input
              id="drawer-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 focus:outline-none transition-colors py-1"
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            {/* Status */}
            <div>
              <label htmlFor="task-status-select" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                id="task-status-select"
                value={task.status}
                onChange={(e) => onUpdate(task.id, { status: e.target.value as TaskStatus })}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority-select" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={task.priority}
                onChange={(e) => onUpdate(task.id, { priority: e.target.value as TaskPriority })}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label htmlFor="task-assignee-select" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                id="task-assignee-select"
                value={task.assigneeId}
                onChange={(e) => onUpdate(task.id, { assigneeId: Number(e.target.value) })}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="task-due-date" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={task.dueDate}
                onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Editable Description */}
          <div>
            <label htmlFor="drawer-description" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              id="drawer-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a more detailed description..."
              className="w-full text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          {/* Timestamps Info */}
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p>Created: {formatDate(task.createdAt)}</p>
            <p>Last updated: {formatDate(task.updatedAt)}</p>
            {task.completedAt && <p className="text-emerald-600 dark:text-emerald-400">Completed: {formatDate(task.completedAt)}</p>}
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Activity &amp; Comments</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                {comments.length}
              </span>
            </h3>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((c) => {
                const author = usersMap[c.authorId];
                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {author?.avatar ? (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center">
                            {author?.name?.[0] || 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {author?.name || `User #${c.authorId}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">
                      {c.message}
                    </p>
                  </div>
                );
              })}

              {comments.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  No comments yet. Start the conversation below.
                </p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 pt-2">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export function TaskDrawer(props: TaskDrawerProps) {
  if (!props.task) return null;

  return (
    <TaskDrawerContent
      key={props.task.id}
      {...props}
      task={props.task}
      currentUserId={props.currentUserId || 1}
    />
  );
}
