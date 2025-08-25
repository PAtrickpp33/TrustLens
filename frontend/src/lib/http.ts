import axios from 'axios';
import { env } from './env';
import { useSessionStore } from '@/store/session';

export const http = axios.create({
  baseURL: env.apiBaseUrl || '/api',
  withCredentials: true,
  timeout: 15000
});

http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    return Promise.reject(error);
  }
);


