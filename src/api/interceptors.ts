import type {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import apiClient from './client';
import { AUTH_ENDPOINTS } from './endpoints';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/api/auth-service';
import { storage, STORAGE_KEYS } from '@/utils/storage';

// Extended request config to track retry attempts
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Module-level shared refresh promise to handle concurrent 401s
let refreshPromise: Promise<string> | null = null;

/**
 * Setup request and response interceptors on the Axios client.
 */
export function setupInterceptors(): void {
  // Clear any existing interceptors to prevent duplicate attachment
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();

  // 1. Request Interceptor: Automatically attach Bearer token
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = useAuthStore.getState();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // 2. Response Interceptor: 401 interception with silent refresh & retry
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomRequestConfig | undefined;

      // If no config or not a 401, reject immediately
      if (!originalRequest || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      // Prevent refresh loops: Do not refresh if request is login, refresh, or already retried
      const isAuthEndpoint =
        originalRequest.url?.includes(AUTH_ENDPOINTS.LOGIN) ||
        originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH);

      if (originalRequest._retry || isAuthEndpoint) {
        return Promise.reject(error);
      }

      const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);

      // If no refresh token exists, immediately clear auth and reject
      if (!refreshToken) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // If a refresh is already underway, reuse the existing promise (Concurrent 401 handling)
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const data = await authService.refreshSession(refreshToken);
              // Save new access token in memory
              useAuthStore.getState().setAccessToken(data.accessToken);
              // Persist rotated refresh token in storage
              if (data.refreshToken) {
                storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
              }
              return data.accessToken;
            } catch (refreshErr) {
              // Refresh failed: wipe session and storage
              storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
              useAuthStore.getState().clearSession();
              throw refreshErr;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        const newAccessToken = await refreshPromise;

        // Update the failed request with the new access token and retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
}
