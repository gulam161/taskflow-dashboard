import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth-service';
import { useAuthStore } from '../store/auth-store';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/auth';
import type { AxiosError } from 'axios';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, setSession, clearSession, setInitializing } =
    useAuthStore();

  const loginMutation = useMutation<LoginResponse, AxiosError<{ message?: string }>, LoginRequest>({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      const authUser: AuthUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
      };

      // Store access token in memory, user in store
      setSession(authUser, data.accessToken);

      // Persist refresh token in localStorage abstraction
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    },
  });

  const logout = () => {
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    clearSession();
    navigate('/login', { replace: true });
  };

  /**
   * Initializes auth session on app startup.
   */
  const initializeAuth = async () => {
    const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      setInitializing(false);
      return;
    }

    try {
      // Refresh the session using persisted refresh token
      const refreshData = await authService.refreshSession(refreshToken);
      useAuthStore.getState().setAccessToken(refreshData.accessToken);

      if (refreshData.refreshToken) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshData.refreshToken);
      }

      // Fetch user profile
      const userProfile = await authService.getCurrentUser();
      setSession(userProfile, refreshData.accessToken);
    } catch {
      // Invalid or expired refresh token
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      clearSession();
    } finally {
      setInitializing(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isInitializing,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.response?.data?.message || loginMutation.error?.message,
    logout,
    initializeAuth,
  };
}
