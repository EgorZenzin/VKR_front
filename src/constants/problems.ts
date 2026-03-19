import type { ProblemType, ProblemInfo } from '../types';

export const PROBLEMS: ProblemInfo[] = [
  {
    type: 'tsp',
    label: 'Задача коммивояжёра (TSP)',
    algorithms: [
      { name: 'nearest_neighbor', label: 'Ближайший сосед' },
      { name: 'genetic', label: 'Генетический алгоритм' },
      { name: 'ant_colony', label: 'Муравьиный алгоритм' },
      { name: 'simulated_annealing', label: 'Имитация отжига' },
    ],
  },
  {
    type: 'assignment',
    label: 'Задача о назначениях',
    algorithms: [
      { name: 'hungarian', label: 'Венгерский метод' },
      { name: 'greedy', label: 'Жадный алгоритм' },
      { name: 'genetic', label: 'Генетический алгоритм' },
    ],
  },
  {
    type: 'knapsack',
    label: 'Задача о рюкзаке',
    algorithms: [
      { name: 'dynamic_programming', label: 'Динамическое программирование' },
      { name: 'greedy', label: 'Жадный алгоритм' },
      { name: 'genetic', label: 'Генетический алгоритм' },
    ],
  },
  {
    type: 'graph_coloring',
    label: 'Раскраска графа',
    algorithms: [
      { name: 'greedy', label: 'Жадный алгоритм' },
      { name: 'genetic', label: 'Генетический алгоритм' },
      { name: 'simulated_annealing', label: 'Имитация отжига' },
    ],
  },
  {
    type: 'max_flow',
    label: 'Максимальный поток',
    algorithms: [
      { name: 'ford_fulkerson', label: 'Форд-Фалкерсон' },
      { name: 'edmonds_karp', label: 'Эдмондс-Карп' },
      { name: 'dinic', label: 'Алгоритм Диница' },
    ],
  },
];

export const PROBLEM_MAP: Record<ProblemType, ProblemInfo> = Object.fromEntries(
  PROBLEMS.map((p) => [p.type, p]),
) as Record<ProblemType, ProblemInfo>;

export const PARAM_DEFS: Record<string, { label: string; min: number; max: number; step: number; default: number }> = {
  generations: { label: 'Поколения', min: 10, max: 1000, step: 10, default: 100 },
  n_iterations: { label: 'Итерации', min: 10, max: 1000, step: 10, default: 100 },
  n_ants: { label: 'Кол-во муравьёв', min: 5, max: 100, step: 5, default: 20 },
  temperature: { label: 'Температура', min: 100, max: 10000, step: 100, default: 1000 },
  cooling_rate: { label: 'Скорость охлаждения', min: 0.8, max: 0.9999, step: 0.001, default: 0.995 },
};

export const ALGO_PARAMS: Record<string, string[]> = {
  genetic: ['generations'],
  ant_colony: ['n_iterations', 'n_ants'],
  simulated_annealing: ['n_iterations', 'temperature', 'cooling_rate'],
  nearest_neighbor: [],
  hungarian: [],
  greedy: [],
  dynamic_programming: [],
  ford_fulkerson: [],
  edmonds_karp: [],
  dinic: [],
};

export const PROBLEM_ICONS: Record<ProblemType, string> = {
  tsp: '🗺️',
  assignment: '📋',
  knapsack: '🎒',
  graph_coloring: '🎨',
  max_flow: '🌊',
};
