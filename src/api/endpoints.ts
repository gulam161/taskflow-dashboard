/** Centralized API endpoint definitions */

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  CURRENT_USER: '/auth/me',
} as const;

export const MOCK_DATA_ENDPOINT = '/mock-data.json';

export const NOTIFICATION_ENDPOINTS = {
  POSTS: 'https://jsonplaceholder.typicode.com/posts',
} as const;
