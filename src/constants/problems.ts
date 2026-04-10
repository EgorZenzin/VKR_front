import type { ProblemType, ProblemInfo } from '../types';

export const PROBLEMS: ProblemInfo[] = [
  {
    type: 'tsp',
    label: 'Задача коммивояжёра (TSP)',
    algorithms: [
      { name: 'greedy', label: 'Жадный алгоритм' },
      { name: 'genetic', label: 'Генетический алгоритм' },
      { name: 'simulated_annealing', label: 'Имитация отжига' },
    ],
  },
  {
    type: 'assignment',
    label: 'Задача о назначениях',
    algorithms: [
      { name: 'greedy', label: 'Жадный алгоритм' },
      { name: 'genetic', label: 'Генетический алгоритм' },
      { name: 'simulated_annealing', label: 'Имитация отжига' },
    ],
  },
  {
    type: 'knapsack',
    label: 'Задача о рюкзаке',
    algorithms: [
      { name: 'greedy', label: 'Жадный алгоритм' },
      { name: 'genetic', label: 'Генетический алгоритм' },
      { name: 'simulated_annealing', label: 'Имитация отжига' },
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
  generations: { label: 'Поколения', min: 50, max: 1000, step: 10, default: 300 },
  population_size: { label: 'Размер популяции', min: 20, max: 300, step: 10, default: 100 },
  mutation_rate: { label: 'Вероятность мутации', min: 0.01, max: 0.3, step: 0.01, default: 0.05 },
  initial_temp: { label: 'Начальная температура', min: 100, max: 50000, step: 100, default: 1000 },
  cooling_rate: { label: 'Скорость охлаждения', min: 0.99, max: 0.9999, step: 0.0001, default: 0.999 },
};

export const ALGO_PARAMS: Record<string, string[]> = {
  genetic: ['generations', 'population_size', 'mutation_rate'],
  simulated_annealing: ['initial_temp', 'cooling_rate'],
  greedy: [],
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
