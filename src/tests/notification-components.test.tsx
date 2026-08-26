import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationPanel } from '@/features/notifications/components/NotificationPanel';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { usePageVisibility } from '@/features/notifications/hooks/use-notifications';
import type { AppNotification } from '@/types/board';

describe('Notification Components & Hooks', () => {
  const sampleItem: AppNotification = {
    id: 101,
    title: 'New review assigned',
    message: 'Please review the pull request for sprint board',
    type: 'review',
    read: false,
    createdAt: new Date().toISOString(),
  };

  describe('NotificationBell', () => {
    it('renders bell icon and badge when unreadCount > 0', () => {
      const handleClick = vi.fn();
      render(
        <NotificationBell
          unreadCount={3}
          isOpen={false}
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: /notifications, 3 unread/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not render numeric badge when unreadCount === 0', () => {
      render(
        <NotificationBell
          unreadCount={0}
          isOpen={false}
          onClick={() => {}}
        />
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('NotificationItem', () => {
    it('renders notification details and triggers markAsRead', () => {
      const handleMarkAsRead = vi.fn();
      const handleDelete = vi.fn();

      render(
        <NotificationItem
          notification={sampleItem}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText('New review assigned')).toBeInTheDocument();
      expect(screen.getByText(/please review the pull request/i)).toBeInTheDocument();

      const markBtn = screen.getByRole('button', { name: /mark "new review assigned" as read/i });
      fireEvent.click(markBtn);
      expect(handleMarkAsRead).toHaveBeenCalledWith(101);

      const deleteBtn = screen.getByRole('button', { name: /delete "new review assigned"/i });
      fireEvent.click(deleteBtn);
      expect(handleDelete).toHaveBeenCalledWith(101);
    });
  });

  describe('NotificationPanel', () => {
    it('renders notification list and handles mark-all-read and pagination', () => {
      const handleMarkAll = vi.fn();
      const handlePageChange = vi.fn();

      render(
        <NotificationPanel
          isOpen={true}
          onClose={() => {}}
          notifications={[sampleItem]}
          unreadCount={1}
          currentPage={1}
          totalPages={2}
          totalNotifications={25}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={handleMarkAll}
          onDelete={() => {}}
          onClearAll={() => {}}
          onPageChange={handlePageChange}
        />
      );

      expect(screen.getByRole('region', { name: /notifications panel/i })).toBeInTheDocument();
      expect(screen.getByText('1 unread')).toBeInTheDocument();

      const markAllBtn = screen.getByRole('button', { name: /mark all read/i });
      fireEvent.click(markAllBtn);
      expect(handleMarkAll).toHaveBeenCalledTimes(1);

      const nextBtn = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('renders empty state when notifications array is empty', () => {
      render(
        <NotificationPanel
          isOpen={true}
          onClose={() => {}}
          notifications={[]}
          unreadCount={0}
          currentPage={1}
          totalPages={1}
          totalNotifications={0}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
          onDelete={() => {}}
          onClearAll={() => {}}
          onPageChange={() => {}}
        />
      );

      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText(/you're completely caught up!/i)).toBeInTheDocument();
    });
  });

  describe('usePageVisibility hook', () => {
    it('responds to document visibilitychange events', () => {
      const { result } = renderHook(() => usePageVisibility());

      expect(result.current).toBe(true);

      // Simulate visibility change to hidden
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          value: 'hidden',
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current).toBe(false);

      // Simulate visibility change back to visible
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          value: 'visible',
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current).toBe(true);
    });
  });
});
