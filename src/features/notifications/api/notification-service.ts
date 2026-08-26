import axios from 'axios';
import { JSON_PLACEHOLDER_URL } from '@/utils/constants';
import type { JsonPlaceholderPost } from '@/types/api';
import type { AppNotification } from '@/types/board';
import mockDataRaw from '../../../../mock-data.json';

const JSON_PLACEHOLDER_POSTS_LIMIT = 5;

export const notificationService = {
  /**
   * Fetch initial notifications from mock-data.json
   */
  async fetchInitialNotifications(): Promise<AppNotification[]> {
    const raw = mockDataRaw as { notifications?: AppNotification[] };
    return raw.notifications || [];
  },

  /**
   * Poll latest posts from JSONPlaceholder
   */
  async fetchPosts(limit = JSON_PLACEHOLDER_POSTS_LIMIT): Promise<JsonPlaceholderPost[]> {
    const response = await axios.get<JsonPlaceholderPost[]>(
      `${JSON_PLACEHOLDER_URL}/posts`,
      {
        params: {
          _limit: limit,
        },
        timeout: 8000,
      }
    );
    return response.data;
  },

  /**
   * Convert a JSONPlaceholder post into an AppNotification
   */
  transformPostToNotification(post: JsonPlaceholderPost): AppNotification {
    // Map post ID into unique notification ID space (2000 + post.id)
    const id = 2000 + post.id;
    // Derive type based on post id
    const types: AppNotification['type'][] = ['task', 'review'];
    const type = types[post.id % types.length];


    // Format title cleanly (capitalize first letter)
    const title =
      post.title.charAt(0).toUpperCase() +
      post.title.slice(1, 50).trim() +
      (post.title.length > 50 ? '...' : '');

    return {
      id,
      title,
      message: post.body.slice(0, 140).replace(/\n/g, ' ').trim(),
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Filter out posts that have already been converted to notifications
   * to ensure no duplicate notifications are generated across polling cycles.
   */
  filterNewPosts(
    posts: JsonPlaceholderPost[],
    knownPostIds: Set<number>
  ): JsonPlaceholderPost[] {
    return posts.filter((post) => !knownPostIds.has(post.id));
  },
};
