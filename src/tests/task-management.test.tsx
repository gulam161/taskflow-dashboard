import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/features/tasks/hooks/use-debounce';
import { taskService } from '@/features/tasks/api/task-service';
import { TaskManagementFilters } from '@/features/tasks/components/TaskManagementFilters';
import { Pagination } from '@/features/tasks/components/Pagination';
import { EmptyState } from '@/features/tasks/components/EmptyState';
import { NetworkError } from '@/features/tasks/components/NetworkError';

describe('useDebounce Custom Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value updates after specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Update prop
    rerender({ value: 'second', delay: 500 });
    // Still 'first' before timer
    expect(result.current).toBe('first');

    // Advance 499ms — still 'first'
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('first');

    // Advance 1ms more (500ms total) — updates to 'second'
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });

  it('cancels pending debounce if value updates before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    rerender({ value: 'ab', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('a');

    rerender({ value: 'abc', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Has not reached 500ms from 'abc' update yet
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('abc');
  });
});

describe('taskService (Data Access & CRUD Layer)', () => {
  it('fetches paginated tasks with default parameters', async () => {
    const res = await taskService.getTasks();
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeLessThanOrEqual(10);
    expect(res.total).toBeGreaterThan(0);
    expect(res.page).toBe(1);
  });

  it('filters tasks by status', async () => {
    const res = await taskService.getTasks({ status: 'done', limit: 50 });
    expect(res.data.every((t) => t.status === 'done')).toBe(true);
  });

  it('filters tasks by priority', async () => {
    const res = await taskService.getTasks({ priority: 'high', limit: 50 });
    expect(res.data.every((t) => t.priority === 'high')).toBe(true);
  });

  it('searches tasks by title keyword', async () => {
    const all = await taskService.getTasks({ limit: 50 });
    if (all.data.length > 0) {
      const sampleTitle = all.data[0].title.split(' ')[0].toLowerCase();
      const res = await taskService.getTasks({ search: sampleTitle });
      expect(res.data.length).toBeGreaterThan(0);
      expect(
        res.data.some(
          (t) =>
            t.title.toLowerCase().includes(sampleTitle) ||
            t.description.toLowerCase().includes(sampleTitle)
        )
      ).toBe(true);
    }
  });

  it('sorts tasks by due date', async () => {
    const asc = await taskService.getTasks({ sortBy: 'dueDate', sortOrder: 'asc', limit: 50 });
    for (let i = 0; i < asc.data.length - 1; i++) {
      const d1 = new Date(asc.data[i].dueDate).getTime();
      const d2 = new Date(asc.data[i + 1].dueDate).getTime();
      expect(d1).toBeLessThanOrEqual(d2);
    }

    const desc = await taskService.getTasks({ sortBy: 'dueDate', sortOrder: 'desc', limit: 50 });
    for (let i = 0; i < desc.data.length - 1; i++) {
      const d1 = new Date(desc.data[i].dueDate).getTime();
      const d2 = new Date(desc.data[i + 1].dueDate).getTime();
      expect(d1).toBeGreaterThanOrEqual(d2);
    }
  });

  it('handles complete CRUD lifecycle: create, get, update, delete', async () => {
    // Create
    const newTask = await taskService.createTask({
      title: 'Automated Test Task',
      description: 'Testing task creation flow',
      status: 'in-progress',
      priority: 'high',
      assigneeId: 1,
      dueDate: '2026-12-31',
      sprintId: 3,
    });
    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Automated Test Task');
    expect(newTask.status).toBe('in-progress');

    // Get by ID
    const fetched = await taskService.getTaskById(newTask.id);
    expect(fetched.id).toBe(newTask.id);
    expect(fetched.title).toBe('Automated Test Task');

    // Update
    const updated = await taskService.updateTask(newTask.id, {
      title: 'Updated Test Task Title',
      status: 'done',
    });
    expect(updated.title).toBe('Updated Test Task Title');
    expect(updated.status).toBe('done');
    expect(updated.completedAt).not.toBeNull();

    // Delete
    const deleteRes = await taskService.deleteTask(newTask.id);
    expect(deleteRes.success).toBe(true);
    expect(deleteRes.id).toBe(newTask.id);

    // Verify deleted
    await expect(taskService.getTaskById(newTask.id)).rejects.toThrow();
  });

  it('computes task summary for dashboard cards', async () => {
    const summary = await taskService.getTaskSummary();
    expect(summary.totalTasks).toBeGreaterThanOrEqual(0);
    expect(summary.pendingTasks).toBeGreaterThanOrEqual(0);
    expect(summary.inProgressTasks).toBeGreaterThanOrEqual(0);
    expect(summary.completedTasks).toBeGreaterThanOrEqual(0);
    expect(summary.highPriorityTasks).toBeGreaterThanOrEqual(0);
  });
});

describe('TaskManagementFilters Component', () => {
  it('renders search input, status filter, priority filter, and sort button', () => {
    const handleSearch = vi.fn();
    const handleStatus = vi.fn();
    const handlePriority = vi.fn();
    const handleSort = vi.fn();
    const handleReset = vi.fn();
    const handleAdd = vi.fn();

    render(
      <TaskManagementFilters
        searchInput=""
        filterStatus="all"
        filterPriority="all"
        sortOrder="asc"
        onSearchChange={handleSearch}
        onStatusChange={handleStatus}
        onPriorityChange={handlePriority}
        onToggleSort={handleSort}
        onResetFilters={handleReset}
        onAddTask={handleAdd}
      />
    );

    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task|add task/i })).toBeInTheDocument();
  });

  it('triggers search callback when input changes', () => {
    const handleSearch = vi.fn();

    render(
      <TaskManagementFilters
        searchInput=""
        filterStatus="all"
        filterPriority="all"
        sortOrder="asc"
        onSearchChange={handleSearch}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onToggleSort={vi.fn()}
        onResetFilters={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(input, { target: { value: 'Bug fix' } });
    expect(handleSearch).toHaveBeenCalledWith('Bug fix');
  });

  it('triggers status change and priority change callbacks', () => {
    const handleStatus = vi.fn();
    const handlePriority = vi.fn();

    render(
      <TaskManagementFilters
        searchInput=""
        filterStatus="all"
        filterPriority="all"
        sortOrder="asc"
        onSearchChange={vi.fn()}
        onStatusChange={handleStatus}
        onPriorityChange={handlePriority}
        onToggleSort={vi.fn()}
        onResetFilters={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const statusSelect = screen.getByLabelText(/filter by status/i);
    fireEvent.change(statusSelect, { target: { value: 'done' } });
    expect(handleStatus).toHaveBeenCalledWith('done');

    const prioritySelect = screen.getByLabelText(/filter by priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    expect(handlePriority).toHaveBeenCalledWith('high');
  });
});

describe('Pagination Component', () => {
  it('renders page info, pagination controls, and handles page transitions', () => {
    const handlePageChange = vi.fn();
    const handlePageSizeChange = vi.fn();

    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        totalItems={30}
        pageSize={10}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    );

    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText(/1–10/i)).toBeInTheDocument();
    expect(screen.getByText(/30/i)).toBeInTheDocument();

    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    fireEvent.click(page2Button);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    const nextButton = screen.getByLabelText(/next page/i);
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});

describe('EmptyState & NetworkError Components', () => {
  it('renders EmptyState with title, description, and action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your filter"
        actionLabel="Reset Now"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filter')).toBeInTheDocument();
    const actionBtn = screen.getByRole('button', { name: /reset now/i });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders NetworkError with custom message and retry button', () => {
    const handleRetry = vi.fn();
    render(
      <NetworkError message="Server timeout 504" onRetry={handleRetry} />
    );

    expect(screen.getByText('Server timeout 504')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
