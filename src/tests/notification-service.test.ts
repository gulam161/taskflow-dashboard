import { describe, it, expect } from 'vitest';
import { notificationService } from '@/features/notifications/api/notification-service';
import type { JsonPlaceholderPost } from '@/types/api';

describe('notificationService', () => {
  it('fetchInitialNotifications retrieves notifications from mock data', async () => {
    const initial = await notificationService.fetchInitialNotifications();
    expect(Array.isArray(initial)).toBe(true);
    expect(initial.length).toBeGreaterThan(0);
    expect(initial[0]).toHaveProperty('title');
    expect(initial[0]).toHaveProperty('message');
    expect(initial[0]).toHaveProperty('read');
  });

  it('transformPostToNotification converts a post into an AppNotification with unique ID', () => {
    const mockPost: JsonPlaceholderPost = {
      userId: 1,
      id: 42,
      title: 'sunt aut facere repellat',
      body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum',
    };

    const notif = notificationService.transformPostToNotification(mockPost);

    expect(notif.id).toBe(2042); // 2000 + post.id
    expect(notif.title).toContain('Sunt aut facere repellat');
    expect(notif.message).toBe(mockPost.body);
    expect(notif.read).toBe(false);
    expect(['task', 'review']).toContain(notif.type);
    expect(notif.createdAt).toBeDefined();

  });

  it('filterNewPosts filters out posts that have already been converted to notifications', () => {
    const posts: JsonPlaceholderPost[] = [
      { userId: 1, id: 1, title: 'Post 1', body: 'Body 1' },
      { userId: 1, id: 2, title: 'Post 2', body: 'Body 2' },
      { userId: 1, id: 3, title: 'Post 3', body: 'Body 3' },
    ];

    const knownIds = new Set([1, 3]);
    const newPosts = notificationService.filterNewPosts(posts, knownIds);

    expect(newPosts).toHaveLength(1);
    expect(newPosts[0].id).toBe(2);
  });
});
