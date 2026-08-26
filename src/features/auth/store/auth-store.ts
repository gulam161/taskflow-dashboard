import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  setInitializing: (value: boolean) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, accessToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  clearSession: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  setInitializing: (value) => {
    set({ isInitializing: value });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  setUser: (user) => {
    set({ user });
  },
}));
