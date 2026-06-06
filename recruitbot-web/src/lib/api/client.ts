import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { API_TIMEOUT, API_BASE } from '../../config/api.config';

const API_BASE_URL = API_BASE || 'http://localhost:3001';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Retry transient network errors and idempotent requests
axiosRetry(apiClient, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx responses
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error?.response && error.response.status >= 500);
  }
});

apiClient.interceptors.request.use((config) => {
  try {
    (config.headers as any)['X-Request-ID'] = (globalThis as any).crypto?.randomUUID?.() || '';
  } catch (e) {}
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response) {
      const status = err.response.status;
      const message = (err.response.data as any)?.error || err.message || 'Request failed';
      console.error('API error', status, message);
      return Promise.reject({ status, data: (err.response.data as any) });
    } else if (err.request) {
      console.error('Network error', err.message);
      return Promise.reject({ status: 0, data: { error: err.message } });
    }
    return Promise.reject(err);
  }
);

export default apiClient;
