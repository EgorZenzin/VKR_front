import axios from 'axios';
import type {
  TaskInfo,
  SolveRequest,
  SolveResponse,
  CompareRequest,
  CompareResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 120_000,
});

export const getTasks = () =>
  api.get<TaskInfo[]>('/tasks').then((r) => r.data);

export const solve = (data: SolveRequest) =>
  api.post<SolveResponse>('/solve', data).then((r) => r.data);

export const compare = (data: CompareRequest) =>
  api.post<CompareResponse>('/compare', data).then((r) => r.data);

export default api;
