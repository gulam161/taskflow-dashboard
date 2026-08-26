import { useState, useEffect, type FormEvent } from 'react';
import type { TaskStatus, TaskPriority, User, CreateTaskPayload } from '@/types/board';
import { KANBAN_COLUMNS, TASK_PRIORITIES } from '@/utils/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddTaskModalProps {
  isOpen: boolean;
  defaultStatus: TaskStatus;
  users: User[];
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => void;
}

interface ModalContentProps {
  defaultStatus: TaskStatus;
  users: User[];
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => void;
}

function AddTaskModalContent({
  defaultStatus,
  users,
  onClose,
  onSubmit,
}: ModalContentProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<number>(users[0]?.id || 1);

  // Default due date: today + 7 days
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });

  const [titleError, setTitleError] = useState<string | undefined>();

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      sprintId: 3,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="add-task-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Task
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add a new task to Sprint 3
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            id="task-title-input"
            label="Task Title"
            type="text"
            placeholder="e.g. Implement user notifications"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(undefined);
            }}
            error={titleError}
            required
            autoFocus
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-description-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
            >
              Description
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              placeholder="What needs to be accomplished in this task?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          {/* Grid: Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="create-task-status"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
              >
                Status
              </label>
              <select
                id="create-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="create-task-priority"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
              >
                Priority
              </label>
              <select
                id="create-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="create-task-assignee"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
              >
                Assignee
              </label>
              <select
                id="create-task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(Number(e.target.value))}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="create-task-due-date"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
              >
                Due Date
              </label>
              <input
                id="create-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddTaskModal(props: AddTaskModalProps) {
  if (!props.isOpen) return null;

  return <AddTaskModalContent {...props} />;
}
