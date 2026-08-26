const STORAGE_PREFIX = 'sprintdesk_';

/**
 * Type-safe localStorage abstraction with namespaced keys.
 * Centralizes storage access to avoid scattered localStorage calls.
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // Fail silently
    }
  },

  clear(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Fail silently
    }
  },
} as const;

/** Well-known storage keys */
export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  BOARD_STATE: 'board_state',
  NOTIFICATIONS: 'notifications',
} as const;
