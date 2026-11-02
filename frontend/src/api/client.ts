import axios from 'axios';

type LogoutFn = () => void;
let _logout: LogoutFn | null = null;

export function setLogoutHandler(fn: LogoutFn) {
  _logout = fn;
}

const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? '';
      if (!url.includes('/api/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        _logout?.();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
