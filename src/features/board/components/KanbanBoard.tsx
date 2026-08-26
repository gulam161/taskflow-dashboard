import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task, TaskStatus, User } from '@/types/board';
import { KANBAN_COLUMNS } from '@/utils/constants';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  columnTasks: Record<TaskStatus, Task[]>;
  usersMap: Record<number, User>;
  commentCounts: Record<number, number>;
  onMoveTask: (taskId: number, destinationStatus: TaskStatus, targetIndex?: number) => void;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanBoard({
  columnTasks,
  usersMap,
  commentCounts,
  onMoveTask,
  onTaskClick,
  onTaskDelete,
  onAddTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Setup sensors with distance constraint so click vs drag are cleanly separated
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const taskData = active.data.current?.task as Task | undefined;
      if (taskData) {
        setActiveTask(taskData);
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeTaskId = Number(active.id);
      const overId = over.id;

      // Check if dropped directly onto a column container
      const isOverColumn = KANBAN_COLUMNS.some((col) => col.id === overId);

      if (isOverColumn) {
        const destinationStatus = overId as TaskStatus;
        onMoveTask(activeTaskId, destinationStatus);
        return;
      }

      // Dropped onto another task
      const overTaskId = Number(overId);
      if (activeTaskId === overTaskId) return;

      // Find the over task to determine its status and index
      let destinationStatus: TaskStatus | undefined;
      let targetIndex: number | undefined;

      for (const col of KANBAN_COLUMNS) {
        const tasksInCol = columnTasks[col.id];
        const index = tasksInCol.findIndex((t) => t.id === overTaskId);
        if (index !== -1) {
          destinationStatus = col.id;
          targetIndex = index;
          break;
        }
      }

      if (destinationStatus) {
        onMoveTask(activeTaskId, destinationStatus, targetIndex);
      }
    },
    [columnTasks, onMoveTask]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start min-h-[600px]">
        {KANBAN_COLUMNS.map((column) => (
          <div key={column.id} className="min-h-[500px] flex flex-col">
            <KanbanColumn
              id={column.id}
              title={column.title}
              tasks={columnTasks[column.id] || []}
              usersMap={usersMap}
              commentCounts={commentCounts}
              onTaskClick={onTaskClick}
              onTaskDelete={onTaskDelete}
              onAddTask={onAddTask}
            />
          </div>
        ))}
      </div>

      {/* Drag preview overlay */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <div className="w-[280px]">
            <TaskCard
              task={activeTask}
              assignee={usersMap[activeTask.assigneeId]}
              commentCount={commentCounts[activeTask.id] || 0}
              onClick={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
