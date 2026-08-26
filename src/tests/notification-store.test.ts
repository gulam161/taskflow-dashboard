import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import { storage } from '@/utils/storage';
import type { AppNotification } from '@/types/board';

const sampleNotifications: AppNotification[] = [
  {
    id: 101,
    title: 'Task assigned',
    message: 'You have been assigned to Task A',
    type: 'task',
    read: false,
    createdAt: '2026-08-19T10:00:00Z',
  },
  {
    id: 102,
    title: 'Review requested',
    message: 'Review requested for Task B',
    type: 'review',
    read: false,
    createdAt: '2026-08-19T11:00:00Z',
  },
  {
    id: 103,
    title: 'Task completed',
    message: 'Task C completed',
    type: 'task',
    read: true,
    createdAt: '2026-08-18T16:00:00Z',
  },
];

describe('notificationStore', () => {
  beforeEach(() => {
    storage.clear();
    useNotificationStore.setState({
      notifications: [],
      knownPostIds: [],
      toastedIds: [],
      isPanelOpen: false,
      currentPage: 1,
      isHydrated: false,
    });
  });

  it('initializes from data and persists to storage', () => {
    const store = useNotificationStore.getState();
    store.initializeFromData(sampleNotifications);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(3);
    expect(state.isHydrated).toBe(true);
    expect(state.getUnreadCount()).toBe(2);
  });

  it('addNotifications prepends unique notifications and records post IDs', () => {
    const store = useNotificationStore.getState();
    store.initializeFromData(sampleNotifications);

    const newNotif: AppNotification = {
      id: 2001,
      title: 'Polled post notification',
      message: 'New content from JSONPlaceholder',
      type: 'task',
      read: false,
      createdAt: '2026-08-20T12:00:00Z',
    };

    store.addNotifications([newNotif], [1]);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(4);
    expect(state.notifications[0].id).toBe(2001); // prepended at top
    expect(state.knownPostIds).toContain(1);
    expect(state.getUnreadCount()).toBe(3);
  });

  it('markAsRead updates read status and unread count', () => {
    const store = useNotificationStore.getState();
    store.initializeFromData(sampleNotifications);

    expect(store.getUnreadCount()).toBe(2);

    store.markAsRead(101);

    const state = useNotificationStore.getState();
    expect(state.notifications.find((n) => n.id === 101)?.read).toBe(true);
    expect(state.getUnreadCount()).toBe(1);
  });

  it('markAllAsRead marks every notification as read', () => {
    const store = useNotificationStore.getState();
    store.initializeFromData(sampleNotifications);

    store.markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.getUnreadCount()).toBe(0);
    expect(state.notifications.every((n) => n.read)).toBe(true);
  });

  it('deleteNotification removes notification from list', () => {
    const store = useNotificationStore.getState();
    store.initializeFromData(sampleNotifications);

    store.deleteNotification(102);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications.some((n) => n.id === 102)).toBe(false);
  });

  it('handles pagination correctly when more than 20 notifications exist', () => {
    const manyNotifications: AppNotification[] = Array.from({ length: 25 }, (_, i) => ({
      id: 500 + i,
      title: `Notification ${i + 1}`,
      message: `Message ${i + 1}`,
      type: 'task',
      read: false,
      createdAt: new Date().toISOString(),
    }));

    const store = useNotificationStore.getState();
    store.initializeFromData(manyNotifications);

    expect(store.getTotalPages()).toBe(2);
    expect(store.getPaginatedNotifications()).toHaveLength(20);

    store.setPage(2);
    const page2 = useNotificationStore.getState().getPaginatedNotifications();
    expect(page2).toHaveLength(5);
  });

  it('markAsToasted tracks toasted notification IDs to avoid duplicates', () => {
    const store = useNotificationStore.getState();
    store.initializeFromData(sampleNotifications);

    store.markAsToasted([2001, 2002]);

    const state = useNotificationStore.getState();
    expect(state.toastedIds).toContain(2001);
    expect(state.toastedIds).toContain(2002);
  });
});
