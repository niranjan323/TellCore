import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7027/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

type RefreshSubscriber = (token: string | null) => void;

let isRefreshing = false;
let subscribers: RefreshSubscriber[] = [];

function onRefreshed(token: string | null) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function waitForRefresh(): Promise<string | null> {
  return new Promise((resolve) => {
    subscribers.push((token) => resolve(token));
  });
}

async function performRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) {
    clear();
    return null;
  }
  try {
    const { data } = await axios.post(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    clear();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    if ((original.url ?? '').includes('/auth/refresh')) {
      useAuthStore.getState().clear();
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      const newToken = await waitForRefresh();
      if (!newToken) return Promise.reject(error);
      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      return apiClient.request(original);
    }

    isRefreshing = true;
    const newToken = await performRefresh();
    isRefreshing = false;
    onRefreshed(newToken);

    if (!newToken) return Promise.reject(error);
    original.headers = original.headers ?? {};
    (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
    return apiClient.request(original);
  },
);

export function buildAbsoluteUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = baseURL.replace(/\/api\/v1\/?$/, '');
  return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
