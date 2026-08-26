import { create } from 'zustand';
import type { AppNotification } from '@/types/board';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { NOTIFICATIONS_PER_PAGE } from '@/utils/constants';

const KNOWN_POST_IDS_KEY = 'notification_known_posts';
const TOASTED_NOTIFICATION_IDS_KEY = 'notification_toasted_ids';

export interface PersistedNotificationState {
  notifications: AppNotification[];
  knownPostIds: number[];
  toastedIds: number[];
}

export interface NotificationStoreState {
  notifications: AppNotification[];
  knownPostIds: number[];
  toastedIds: number[];
  isPanelOpen: boolean;
  currentPage: number;
  isHydrated: boolean;

  // Actions
  initializeFromData: (initialNotifications: AppNotification[]) => void;
  addNotifications: (newNotifications: AppNotification[], newPostIds: number[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAll: () => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  setPage: (page: number) => void;
  markAsToasted: (ids: number[]) => void;

  // Derived getters
  getUnreadCount: () => number;
  getPaginatedNotifications: () => AppNotification[];
  getTotalPages: () => number;
}

function persistState(state: {
  notifications: AppNotification[];
  knownPostIds: number[];
  toastedIds: number[];
}) {
  storage.set(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
  storage.set(KNOWN_POST_IDS_KEY, state.knownPostIds);
  storage.set(TOASTED_NOTIFICATION_IDS_KEY, state.toastedIds);
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  knownPostIds: [],
  toastedIds: [],
  isPanelOpen: false,
  currentPage: 1,
  isHydrated: false,

  initializeFromData: (initialNotifications) => {
    // 1. Check if there are persisted notifications in localStorage
    const persisted = storage.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    const persistedPosts = storage.get<number[]>(KNOWN_POST_IDS_KEY) || [];
    const persistedToasted = storage.get<number[]>(TOASTED_NOTIFICATION_IDS_KEY) || [];

    if (persisted && persisted.length > 0) {
      set({
        notifications: persisted,
        knownPostIds: persistedPosts,
        toastedIds: persistedToasted,
        isHydrated: true,
      });
      return;
    }

    // 2. Otherwise initialize from initial mock data
    const initialToasted = initialNotifications.map((n) => n.id);
    set({
      notifications: initialNotifications,
      knownPostIds: [],
      toastedIds: initialToasted,
      isHydrated: true,
    });

    persistState({
      notifications: initialNotifications,
      knownPostIds: [],
      toastedIds: initialToasted,
    });
  },

  addNotifications: (newNotifications, newPostIds) => {
    if (newNotifications.length === 0) return;

    const { notifications, knownPostIds, toastedIds } = get();

    // Prevent duplicate notification IDs
    const existingIds = new Set(notifications.map((n) => n.id));
    const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id));

    if (uniqueNew.length === 0) return;

    // Prepend new notifications so newest appear first
    const updatedNotifications = [...uniqueNew, ...notifications];
    const updatedKnownPosts = Array.from(new Set([...knownPostIds, ...newPostIds]));

    set({
      notifications: updatedNotifications,
      knownPostIds: updatedKnownPosts,
    });

    persistState({
      notifications: updatedNotifications,
      knownPostIds: updatedKnownPosts,
      toastedIds,
    });
  },

  markAsRead: (id) => {
    const { notifications, knownPostIds, toastedIds } = get();
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));

    set({ notifications: updated });
    persistState({ notifications: updated, knownPostIds, toastedIds });
  },

  markAllAsRead: () => {
    const { notifications, knownPostIds, toastedIds } = get();
    const updated = notifications.map((n) => ({ ...n, read: true }));

    set({ notifications: updated });
    persistState({ notifications: updated, knownPostIds, toastedIds });
  },

  deleteNotification: (id) => {
    const { notifications, knownPostIds, toastedIds, currentPage } = get();
    const updated = notifications.filter((n) => n.id !== id);

    // Adjust current page if last item on page was deleted
    const maxPage = Math.max(1, Math.ceil(updated.length / NOTIFICATIONS_PER_PAGE));
    const nextPage = Math.min(currentPage, maxPage);

    set({
      notifications: updated,
      currentPage: nextPage,
    });

    persistState({ notifications: updated, knownPostIds, toastedIds });
  },

  clearAll: () => {
    const { knownPostIds, toastedIds } = get();
    set({
      notifications: [],
      currentPage: 1,
    });
    persistState({ notifications: [], knownPostIds, toastedIds });
  },

  togglePanel: () => {
    set((s) => ({ isPanelOpen: !s.isPanelOpen }));
  },

  setPanelOpen: (open) => {
    set({ isPanelOpen: open });
  },

  setPage: (page) => {
    set({ currentPage: page });
  },

  markAsToasted: (ids) => {
    const { notifications, knownPostIds, toastedIds } = get();
    const updatedToasted = Array.from(new Set([...toastedIds, ...ids]));

    set({ toastedIds: updatedToasted });
    persistState({
      notifications,
      knownPostIds,
      toastedIds: updatedToasted,
    });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  getPaginatedNotifications: () => {
    const { notifications, currentPage } = get();
    const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
    return notifications.slice(startIndex, startIndex + NOTIFICATIONS_PER_PAGE);
  },

  getTotalPages: () => {
    const total = get().notifications.length;
    return Math.max(1, Math.ceil(total / NOTIFICATIONS_PER_PAGE));
  },
}));
