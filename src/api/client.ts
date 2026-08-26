import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

/**
 * Axios instance configured for DummyJSON API.
 * Interceptors are attached separately in interceptors.ts.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

export default apiClient;
