/** DummyJSON login request payload */
export interface LoginRequest {
  username: string;
  password: string;
}

/** DummyJSON login response */
export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

/** DummyJSON refresh token request */
export interface RefreshRequest {
  refreshToken: string;
  expiresInMins?: number;
}

/** DummyJSON refresh token response */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/** Authenticated user stored in the auth store */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}
