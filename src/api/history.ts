import api from './client';
import type { SolveHistoryOut, ComparisonHistoryOut } from '../types';

export const getSolveHistory = (limit = 50, offset = 0) =>
  api
    .get<SolveHistoryOut[]>('/history/solve', { params: { limit, offset } })
    .then((r) => r.data);

export const getCompareHistory = (limit = 50, offset = 0) =>
  api
    .get<ComparisonHistoryOut[]>('/history/compare', { params: { limit, offset } })
    .then((r) => r.data);

export const deleteSolveHistory = (id: number) =>
  api.delete<void>(`/history/solve/${id}`).then((r) => r.data);

export const deleteCompareHistory = (id: number) =>
  api.delete<void>(`/history/compare/${id}`).then((r) => r.data);
