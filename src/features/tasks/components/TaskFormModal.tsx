import { useState, useEffect, type FormEvent } from 'react';
import type { Task, TaskStatus, TaskPriority, User, CreateTaskPayload, UpdateTaskPayload } from '@/types/board';
import { KANBAN_COLUMNS, TASK_PRIORITIES } from '@/utils/constants';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null; // null = create mode
  users: User[];
  isSubmitting?: boolean;
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => void;
  onUpdate: (data: { id: number; updates: UpdateTaskPayload }) => void;
}

/**
 * Create / Edit task modal.
 * In create mode (editingTask === null): initializes with defaults.
 * In edit mode: pre-populates from editingTask.
 */
export function TaskFormModal({
  isOpen,
  editingTask,
  users,
  isSubmitting = false,
  onClose,
  onCreate,
  onUpdate,
}: TaskFormModalProps) {
  const isEditMode = editingTask !== null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<number>(users[0]?.id || 1);
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();

  // Reset form when modal opens or editingTask changes
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setStatus(editingTask.status);
        setPriority(editingTask.priority);
        setAssigneeId(editingTask.assigneeId);
        setDueDate(editingTask.dueDate);
      } else {
        setTitle('');
        setDescription('');
        setStatus('backlog');
        setPriority('medium');
        setAssigneeId(users[0]?.id || 1);
        // Default due date: today + 7 days
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setDueDate(date.toISOString().split('T')[0]);
      }
      setTitleError(undefined);
    }
  }, [isOpen, editingTask, users]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    if (isEditMode && editingTask) {
      onUpdate({
        id: editingTask.id,
        updates: {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          assigneeId,
          dueDate: dueDate || new Date().toISOString().split('T')[0],
        },
      });
    } else {
      onCreate({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        sprintId: 3,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      description={isEditMode ? `Editing task #${editingTask?.id}` : 'Add a new task to the project'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          id="task-form-title"
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
            htmlFor="task-form-description"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
          >
            Description
          </label>
          <textarea
            id="task-form-description"
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
              htmlFor="task-form-status"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
            >
              Status
            </label>
            <select
              id="task-form-status"
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
              htmlFor="task-form-priority"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
            >
              Priority
            </label>
            <select
              id="task-form-priority"
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
              htmlFor="task-form-assignee"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
            >
              Assignee
            </label>
            <select
              id="task-form-assignee"
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
              htmlFor="task-form-due-date"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide"
            >
              Due Date
            </label>
            <input
              id="task-form-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
