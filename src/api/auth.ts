import api from './client';
import type { TokenPair, User } from '../types';

export const registerUser = (email: string, username: string, password: string) =>
  api
    .post<User>('/auth/register', { email, username, password })
    .then((r) => r.data);

export const loginUser = (username: string, password: string) => {
  // Бэкенд для логина ждёт application/x-www-form-urlencoded
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);
  return api
    .post<TokenPair>('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then((r) => r.data);
};

export const refreshTokens = (refresh_token: string) =>
  api.post<TokenPair>('/auth/refresh', { refresh_token }).then((r) => r.data);

export const fetchMe = () => api.get<User>('/auth/me').then((r) => r.data);
