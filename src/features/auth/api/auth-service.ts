import axios from 'axios';
import apiClient from '@/api/client';
import { AUTH_ENDPOINTS } from '@/api/endpoints';
import { API_BASE_URL } from '@/utils/constants';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  AuthUser,
} from '@/types/auth';

/**
 * Authentication service layer.
 * All authentication network calls are centralized here.
 */
export const authService = {
  /**
   * Log in user with username and password.
   * Uses DummyJSON POST /auth/login.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      {
        username: credentials.username.trim(),
        password: credentials.password,
        expiresInMins: 60, // 1 hour token lifetime
      }
    );
    return response.data;
  },

  /**
   * Refresh an expired session using the refresh token.
   * Note: Uses a clean axios instance to avoid triggering the 401 interceptor loop.
   */
  async refreshSession(refreshToken: string): Promise<RefreshResponse> {
    const response = await axios.post<RefreshResponse>(
      `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
      {
        refreshToken,
        expiresInMins: 60,
      } as RefreshRequest,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      }
    );
    return response.data;
  },

  /**
   * Fetch currently authenticated user profile using access token.
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(AUTH_ENDPOINTS.CURRENT_USER);
    return response.data;
  },
};
