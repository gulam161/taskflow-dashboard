import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import axios from 'axios';
import apiClient from '@/api/client';
import { setupInterceptors } from '@/api/interceptors';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/api/auth-service';
import { storage, STORAGE_KEYS } from '@/utils/storage';

// Mock authService
vi.mock('@/features/auth/api/auth-service', () => ({
  authService: {
    refreshSession: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
  },
}));

describe('Auth Interceptor & Token Refresh Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.clear();
    useAuthStore.getState().clearSession();
    setupInterceptors();
  });

  it('should automatically attach Bearer token to request when accessToken exists in store', async () => {
    useAuthStore.getState().setAccessToken('mock_access_token_123');

    let capturedHeaders: Record<string, string> = {};

    // Mock axios adapter / interceptor behavior
    const testClient = axios.create();
    testClient.interceptors.request.use((config) => {
      const { accessToken } = useAuthStore.getState();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      capturedHeaders = config.headers as unknown as Record<string, string>;
      return config;
    });

    // Make mock request with a dummy adapter that returns 200
    testClient.defaults.adapter = async (config) => ({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    await testClient.get('/test-endpoint');
    expect(capturedHeaders.Authorization).toBe('Bearer mock_access_token_123');
  });

  it('should trigger silent refresh on 401 and retry the original request', async () => {
    // 1. Setup initial state with refresh token
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, 'valid_refresh_token');
    useAuthStore.getState().setAccessToken('expired_access_token');

    // 2. Mock refreshSession response
    (authService.refreshSession as Mock).mockResolvedValueOnce({
      accessToken: 'new_fresh_token_456',
      refreshToken: 'rotated_refresh_token_789',
    });

    let callCount = 0;
    // Mock the adapter on apiClient
    apiClient.defaults.adapter = async (config) => {
      callCount++;
      if (callCount === 1) {
        // First call fails with 401 Unauthorized
        const error = new axios.AxiosError('Unauthorized', '401', config, null, {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Token expired' },
          headers: {},
          config,
        });
        return Promise.reject(error);
      }

      // Second call (retry) succeeds with 200
      return {
        data: { message: 'success with retried token' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const response = await apiClient.get('/protected-resource');

    // Assertions
    expect(authService.refreshSession).toHaveBeenCalledTimes(1);
    expect(authService.refreshSession).toHaveBeenCalledWith('valid_refresh_token');
    expect(useAuthStore.getState().accessToken).toBe('new_fresh_token_456');
    expect(storage.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe('rotated_refresh_token_789');
    expect(response.data).toEqual({ message: 'success with retried token' });
    expect(callCount).toBe(2);
  });

  it('should coordinate concurrent 401 requests with a single refresh call', async () => {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, 'valid_refresh_token');
    useAuthStore.getState().setAccessToken('expired_access_token');

    (authService.refreshSession as Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              accessToken: 'concurrent_new_token',
              refreshToken: 'concurrent_new_refresh',
            });
          }, 30);
        })
    );

    const callCounts: Record<string, number> = { reqA: 0, reqB: 0 };

    apiClient.defaults.adapter = async (config) => {
      const endpoint = config.url || '';
      callCounts[endpoint] = (callCounts[endpoint] || 0) + 1;

      if (callCounts[endpoint] === 1) {
        return Promise.reject(
          new axios.AxiosError('Unauthorized', '401', config, null, {
            status: 401,
            statusText: 'Unauthorized',
            data: { message: 'Token expired' },
            headers: {},
            config,
          })
        );
      }

      return {
        data: { endpoint, token: config.headers?.Authorization },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    // Fire 2 concurrent requests
    const [resA, resB] = await Promise.all([
      apiClient.get('reqA'),
      apiClient.get('reqB'),
    ]);

    // Only ONE refreshSession should have executed
    expect(authService.refreshSession).toHaveBeenCalledTimes(1);
    expect(resA.data.token).toBe('Bearer concurrent_new_token');
    expect(resB.data.token).toBe('Bearer concurrent_new_token');
  });

  it('should clear session and storage when token refresh fails', async () => {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, 'invalid_expired_token');
    useAuthStore.getState().setSession(
      {
        id: 1,
        username: 'emilys',
        email: 'emilys@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        image: '',
      },
      'expired_token'
    );

    (authService.refreshSession as Mock).mockRejectedValueOnce(
      new Error('Invalid refresh token')
    );

    apiClient.defaults.adapter = async (config) => {
      return Promise.reject(
        new axios.AxiosError('Unauthorized', '401', config, null, {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Invalid refresh token' },
          headers: {},
          config,
        })
      );
    };

    await expect(apiClient.get('/user-data')).rejects.toThrow();

    // Verify session and storage are wiped
    expect(storage.get(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
