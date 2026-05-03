/* ───── API типы ───── */

export interface AlgorithmInfo {
  name: string;
  display_name: string;
}

export interface TaskInfo {
  name: string;
  display_name: string;
  description: string;
  optimization: 'minimize' | 'maximize';
  algorithms: AlgorithmInfo[];
}

export interface City {
  x: number;
  y: number;
}

export interface KnapsackItem {
  weight: number;
  value: number;
}

/* ───── Запросы ───── */

export interface SolveRequest {
  task_name: string;
  algorithm: string;
  input_data: Record<string, unknown>;
  params?: Record<string, number>;
}

export interface CompareRequest {
  task_name: string;
  algorithms: string[];
  input_data: Record<string, unknown>;
  params?: Record<string, Record<string, number>>;
}

/* ───── Ответы ───── */

/**
 * Метрики ML — структура динамическая, зависит от backend.
 * Известные поля приведены как опциональные подсказки для UI,
 * но фронт обязан корректно отображать любые ключи, пришедшие от API.
 */
export interface MLMetrics extends Record<string, unknown> {
  ml_used?: boolean;
  surrogate_model?: string;
  exact_evaluations?: number;
  surrogate_evaluations?: number;
  surrogate_accuracy_r2?: number;
  warmup_generations?: number;
  surrogate_ratio?: number;
  training_samples?: number;
  optimality_guaranteed?: boolean;
}

export interface AlgorithmResultResponse {
  task_name: string;
  task_display_name: string;
  algorithm_name: string;
  display_name: string;
  input_data: Record<string, unknown>;
  solution: unknown;
  objective_value: number;
  execution_time: number;
  iterations: number;
  convergence_history: number[];
  visualization_data: Record<string, unknown> | null;
  ml_metrics: MLMetrics | null;
}

export type SolveResponse = AlgorithmResultResponse;

export interface ConvergencePoint {
  iteration: number;
  value: number;
}

export interface ConvergenceSeries {
  algorithm_name: string;
  display_name: string;
  data: ConvergencePoint[];
}

export interface LabelValues {
  labels: string[];
  values: number[];
}

export interface ComparisonCharts {
  convergence: ConvergenceSeries[];
  time_comparison: LabelValues;
  quality_comparison: LabelValues;
}

export interface CompareResponse {
  task_name: string;
  task_display_name: string;
  input_data: Record<string, unknown>;
  algorithms: string[];
  results: AlgorithmResultResponse[];
  comparison_charts: ComparisonCharts;
}

/* ───── Auth / History ───── */

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface SolveHistoryOut {
  id: number;
  task_name: string;
  algorithm: string;
  input_data: Record<string, unknown>;
  params: Record<string, unknown> | null;
  result: Record<string, unknown>;
  objective_value: number | null;
  elapsed_ms: number | null;
  created_at: string;
}

export interface ComparisonHistoryOut {
  id: number;
  task_name: string;
  algorithms: string[];
  input_data: Record<string, unknown>;
  params: Record<string, unknown> | null;
  result: Record<string, unknown>;
  algorithms_count: number;
  created_at: string;
}
