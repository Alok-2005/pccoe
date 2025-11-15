// File: web/src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL ='http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
  error.response?.status === 401 &&
  !error.config.url?.includes('/auth/login')
) {
  useAuthStore.getState().clearAuth();
  toast.error('Session expired. Please log in again.');
  window.location.href = '/login';
}

    return Promise.reject(error);
  }
);

export default client;