import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  xsrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME,
  xsrfHeaderName: import.meta.env.VITE_CSRF_HEADER_NAME,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const genericError = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(genericError);
  }
);

export default api;