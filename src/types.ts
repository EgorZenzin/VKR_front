/* ───────── Общие ───────── */
export type ProblemType = 'tsp' | 'assignment' | 'knapsack' | 'graph_coloring' | 'max_flow';

export interface AlgorithmInfo {
  name: string;
  label: string;
}

export interface ProblemInfo {
  type: ProblemType;
  label: string;
  algorithms: AlgorithmInfo[];
}

/* ───────── Входные данные ───────── */
export interface City {
  x: number;
  y: number;
}

export interface KnapsackItem {
  weight: number;
  value: number;
}

export interface FlowEdge {
  from: number;
  to: number;
  capacity: number;
}

export type InputData =
  | { cities: City[] }
  | { cost_matrix: number[][] }
  | { items: KnapsackItem[]; capacity: number }
  | { num_vertices: number; edges: number[][] }
  | { num_vertices: number; edges: FlowEdge[]; source: number; sink: number };

/* ───────── Запросы ───────── */
export interface SolveRequest {
  problem_type: ProblemType;
  algorithm: string;
  input_data: InputData;
  params: Record<string, number>;
}

export interface CompareRequest {
  problem_type: ProblemType;
  algorithms: string[];
  input_data: InputData;
  params: Record<string, number>;
}

/* ───────── Ответы ───────── */
export interface SolveResult {
  id?: number;
  problem_type: string;
  algorithm: string;
  result: unknown;
  objective_value: number;
  execution_time: number;
  params: Record<string, number>;
  created_at?: string;
}

export interface CompareResult {
  id?: number;
  problem_type: string;
  algorithms: string[];
  results: SolveResult[];
  created_at?: string;
}

export interface HistoryItem {
  id: number;
  problem_type: string;
  algorithm: string;
  objective_value: number;
  execution_time: number;
  created_at: string;
  params: Record<string, number>;
  input_data: InputData;
  result: unknown;
}

export interface ComparisonHistoryItem {
  id: number;
  problem_type: string;
  algorithms: string[];
  results: SolveResult[];
  created_at: string;
}
