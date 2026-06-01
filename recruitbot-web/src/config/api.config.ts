// Frontend API configuration using Vite env variables
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.VITE_API_BASE ||
  '/';
export const API_TIMEOUT = Number((import.meta as any).env?.VITE_API_TIMEOUT) || 30000;

export default {
  base: API_BASE,
  timeout: API_TIMEOUT
};
