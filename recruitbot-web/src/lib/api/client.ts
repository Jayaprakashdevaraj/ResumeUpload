import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_TIMEOUT, API_BASE } from '../../config/api.config';

const API_BASE_URL = API_BASE || 'http://localhost:3001';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' }
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
    } else if (err.request) {
      console.error('Network error', err.message);
    }
    return Promise.reject(err);
  }
);

export default apiClient;
