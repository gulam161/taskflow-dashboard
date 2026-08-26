import { create } from 'zustand';
import type { Theme } from '@/types/common';
import { storage, STORAGE_KEYS } from '@/utils/storage';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  const stored = storage.get<Theme>(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      storage.set(STORAGE_KEYS.THEME, next);
      return { theme: next };
    });
  },

  setTheme: (theme: Theme) => {
    storage.set(STORAGE_KEYS.THEME, theme);
    set({ theme });
  },
}));
