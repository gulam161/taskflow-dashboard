import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers';
import { setupInterceptors } from '@/api/interceptors';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/api/auth-service';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';

export function App() {
  const { isInitializing, setSession, clearSession, setInitializing } = useAuthStore();

  useEffect(() => {
    // 1. Attach Axios interceptors once
    setupInterceptors();

    // 2. Centralized session initialization flow
    const initSession = async () => {
      const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        setInitializing(false);
        return;
      }

      try {
        const refreshData = await authService.refreshSession(refreshToken);
        useAuthStore.getState().setAccessToken(refreshData.accessToken);

        if (refreshData.refreshToken) {
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshData.refreshToken);
        }

        // Fetch user profile
        const userProfile = await authService.getCurrentUser();
        setSession(userProfile, refreshData.accessToken);
      } catch {
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        clearSession();
      } finally {
        setInitializing(false);
      }
    };

    void initSession();
  }, [setSession, clearSession, setInitializing]);

  return (
    <AppProviders>
      {isInitializing ? (
        <FullScreenLoader message="Validating Session..." />
      ) : (
        <RouterProvider router={router} />
      )}
    </AppProviders>
  );
}

export default App;
