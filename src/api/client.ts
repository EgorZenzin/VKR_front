import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

/* ──────────────────────────────────────────────────────────────────
 *  Базовый axios-клиент с авторизацией и refresh-flow.
 *
 *  baseURL = '/api' — Vite-прокси перенаправит на http://localhost:8000.
 *  Токены хранятся в localStorage:
 *    - access_token
 *    - refresh_token
 *
 *  При 401:
 *    - один раз пробуем POST /auth/refresh с refresh_token;
 *    - параллельные 401 ставятся в очередь и используют один и тот же
 *      refresh-запрос (single-flight);
 *    - если refresh неуспешен — чистим localStorage и редиректим на /login.
 * ────────────────────────────────────────────────────────────────── */

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const api = axios.create({
  baseURL: '/api',
  timeout: 120_000,
});

/* ───── request: подставляем Bearer ───── */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ───── response: refresh-flow ───── */

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

let refreshPromise: Promise<string> | null = null;

const performRefresh = async (): Promise<string> => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');

  // Используем "голый" axios, чтобы не зацикливать interceptor.
  const { data } = await axios.post<TokenPairResponse>(
    '/api/auth/refresh',
    { refresh_token: refresh },
    { timeout: 30_000 },
  );
  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
};

const handleAuthFailure = () => {
  clearTokens();
  // Не перезагружаем приложение если уже на /login.
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      // запрос самого refresh не пытаемся обновлять
      (typeof original.url === 'string' && original.url.includes('/auth/refresh')) ||
      (typeof original.url === 'string' && original.url.includes('/auth/login'))
    ) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      return api.request(original);
    } catch (e) {
      handleAuthFailure();
      return Promise.reject(e);
    }
  },
);

/** Выдрать человекочитаемое сообщение из axios-ошибки. */
export const extractErrorMessage = (err: unknown, fallback = 'Ошибка запроса'): string => {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      // pydantic validation errors
      return detail
        .map((d) =>
          typeof d === 'object' && d && 'msg' in d
            ? String((d as { msg: unknown }).msg)
            : JSON.stringify(d),
        )
        .join('; ');
    }
    if (detail && typeof detail === 'object') return JSON.stringify(detail);
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

export default api;
