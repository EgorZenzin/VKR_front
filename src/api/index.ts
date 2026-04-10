import axios from 'axios';
import type {
  SolveRequest,
  CompareRequest,
  SolveResult,
  CompareResult,
  HistoryItem,
  ComparisonHistoryItem,
} from '../types';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 120_000,
});

/* ─── Задачи и алгоритмы ─── */
export const getProblems = () => api.get('/problems').then((r) => r.data);

/* ─── Решение ─── */
export const solve = (data: SolveRequest) =>
  api.post<SolveResult>('/solve', data).then((r) => r.data);

export const solvePreview = (data: SolveRequest) =>
  api.post<SolveResult>('/solve/preview', data).then((r) => r.data);

/* ─── Сравнение ─── */
export const compare = (data: CompareRequest) =>
  api.post<CompareResult>('/compare', data).then((r) => r.data);

/* ─── История ─── */
export const getHistory = () =>
  api.get<HistoryItem[]>('/history/').then((r) => r.data);

export const getComparisons = () =>
  api.get<ComparisonHistoryItem[]>('/history/comparisons/').then((r) => r.data);

export default api;
