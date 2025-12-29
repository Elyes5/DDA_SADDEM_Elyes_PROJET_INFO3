import axios, { 
  type InternalAxiosRequestConfig, 
  type AxiosResponse 
} from 'axios';

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: Error) => void;
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }

    const originalRequest = error.config as CustomRequestConfig;

    // If it's a 401 and it's not already a retry attempt
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Waiting for actual refresh
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({ 
            resolve, 
            reject: (err: Error) => reject(err) 
          });
        })
          .then(() => api(originalRequest))
          .catch((err : Error) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Using of refreshApi (No interceptors here)
        await refreshApi.post('/api/auth/refresh');
        
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError: unknown) {
        const standardizedError = refreshError instanceof Error 
          ? refreshError 
          : new Error('Session expirée');

        processQueue(standardizedError);
        
        // --- TODO : Force logout if refresh fails ---
        
        return Promise.reject(standardizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;