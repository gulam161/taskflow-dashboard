import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../api/notification-service';
import { useNotificationStore } from '../store/notification-store';
import { NOTIFICATION_POLL_INTERVAL, NOTIFICATIONS_PER_PAGE } from '@/utils/constants';
import { toast } from '@/components/ui/Toast';

import type { AppNotification } from '@/types/board';

/**
 * Custom hook to monitor document visibility using the Page Visibility API.
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Main notifications hook that manages:
 * 1. Initial notification hydration from mock data / storage
 * 2. Background polling from JSONPlaceholder posts with visibility-aware pause/resume
 * 3. Deduplication of posts
 * 4. Closed-panel toast triggers for newly discovered notifications
 * 5. Pagination, unread counter, and notification actions
 */
export function useNotifications() {
  const isPageVisible = usePageVisibility();

  const {
    notifications,
    knownPostIds,
    toastedIds,
    isPanelOpen,
    currentPage,
    isHydrated,
    initializeFromData,
    addNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    togglePanel,
    setPanelOpen,
    setPage,
    markAsToasted,
  } = useNotificationStore();


  // 1. Initial load from mock-data
  const { data: initialData } = useQuery<AppNotification[], Error>({
    queryKey: ['notifications-initial'],
    queryFn: () => notificationService.fetchInitialNotifications(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (initialData && !isHydrated) {
      initializeFromData(initialData);
    }
  }, [initialData, isHydrated, initializeFromData]);

  // 2. JSONPlaceholder polling with Page Visibility API integration
  // Polling interval is active ONLY when the tab is visible.
  const { data: polledPosts } = useQuery({
    queryKey: ['notifications-polling'],
    queryFn: () => notificationService.fetchPosts(5),
    enabled: isHydrated,
    // Only poll when page is visible; pause when hidden
    refetchInterval: isPageVisible ? NOTIFICATION_POLL_INTERVAL : false,
    refetchIntervalInBackground: false, // Strict pause in background
    refetchOnWindowFocus: true, // Resume and refresh on tab focus
  });

  // 3. Ingest newly polled posts and trigger toasts if panel is closed
  useEffect(() => {
    if (!polledPosts || polledPosts.length === 0 || !isHydrated) return;

    const knownSet = new Set(knownPostIds);
    const newPosts = notificationService.filterNewPosts(polledPosts, knownSet);

    if (newPosts.length === 0) return;

    // Convert new posts to AppNotification items
    const newNotifications = newPosts.map(notificationService.transformPostToNotification);
    const newPostIds = newPosts.map((p) => p.id);

    // Add new notifications to Zustand store
    addNotifications(newNotifications, newPostIds);

    // Check if new notifications need to trigger a toast (if panel is closed)
    const toastedSet = new Set(toastedIds);
    const notificationsToToast = newNotifications.filter((n) => !toastedSet.has(n.id));

    if (notificationsToToast.length > 0) {
      if (!isPanelOpen) {
        // Show toast for the latest new notification
        const latest = notificationsToToast[0];
        toast(
          `New notification: ${latest.title}`,
          latest.type === 'review' ? 'warning' : 'info'
        );
      }
      // Mark as toasted so we never repeatedly toast the same notification
      markAsToasted(notificationsToToast.map((n) => n.id));
    }
  }, [polledPosts, knownPostIds, toastedIds, isHydrated, isPanelOpen, addNotifications, markAsToasted]);

  // Memoized unread count and paginated view
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
    return notifications.slice(startIndex, startIndex + NOTIFICATIONS_PER_PAGE);
  }, [notifications, currentPage]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(notifications.length / NOTIFICATIONS_PER_PAGE)),
    [notifications]
  );


  const handleMarkAsRead = useCallback((id: number) => {
    markAsRead(id);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleDelete = useCallback((id: number) => {
    deleteNotification(id);
  }, [deleteNotification]);

  const handleClearAll = useCallback(() => {
    clearAll();
  }, [clearAll]);

  return {
    notifications,
    paginatedNotifications,
    unreadCount,
    currentPage,
    totalPages,
    totalNotifications: notifications.length,
    isPanelOpen,
    isPageVisible,
    isHydrated,
    togglePanel,
    setPanelOpen,
    setPage,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    clearAll: handleClearAll,
  };
}
