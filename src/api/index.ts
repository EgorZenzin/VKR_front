import api from './client';
import type {
  TaskInfo,
  AlgorithmInfo,
  SolveRequest,
  SolveResponse,
  CompareRequest,
  CompareResponse,
} from '../types';

export * from './client';
export * from './auth';
export * from './history';

export const getTasks = () =>
  api.get<TaskInfo[]>('/tasks').then((r) => r.data);

export const getTaskAlgorithms = (taskName: string) =>
  api
    .get<AlgorithmInfo[]>(`/tasks/${encodeURIComponent(taskName)}/algorithms`)
    .then((r) => r.data);

export const solveTask = (data: SolveRequest) =>
  api.post<SolveResponse>('/solve', data).then((r) => r.data);

export const compareTasks = (data: CompareRequest) =>
  api.post<CompareResponse>('/compare', data).then((r) => r.data);

// Backwards-compatible aliases
export const solve = solveTask;
export const compare = compareTasks;

export default api;
