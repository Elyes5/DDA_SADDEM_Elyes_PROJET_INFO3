import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'

interface FailedRequest {
  resolve: (value?: unknown) => void
  reject: (error: Error) => void
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
})

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const csrfToken = getCookie(import.meta.env.VITE_CSRF_COOKIE_NAME);
  const method = config.method?.toLowerCase();
  
  if (csrfToken && config.headers && method !== 'get') {
    config.headers[import.meta.env.VITE_CSRF_HEADER_NAME] = csrfToken;
  }
  
  return config;
});

refreshApi.interceptors.request.use((config) => {
  const csrfToken = getCookie(import.meta.env.VITE_CSRF_COOKIE_NAME);
  const method = config.method?.toLowerCase();

  if (csrfToken && config.headers && method !== 'get') {
    config.headers[import.meta.env.VITE_CSRF_HEADER_NAME] = csrfToken;
  }
  return config;
});

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: Error | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(
        error instanceof Error ? error : new Error(String(error))
      )
    }

    const originalRequest = error.config as CustomRequestConfig

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject: (err: Error) => reject(err),
          })
        })
          .then(() => api(originalRequest))
          .catch((err: Error) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await refreshApi.post('/api/auth/refresh')
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError: unknown) {
        const standardizedError =
          refreshError instanceof Error ? refreshError : new Error('Session expirée')
        processQueue(standardizedError)
        return Promise.reject(standardizedError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api