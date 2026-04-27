import type { AlgorithmInfo, AlgorithmResultResponse } from '../types';

/** ML-алгоритмом считается тот, чьё имя оканчивается на "_ml". */
export const isMlAlgorithm = (name: string): boolean => name.endsWith('_ml');

/** Базовое имя алгоритма без суффикса "_ml". */
export const baseAlgorithmName = (name: string): string =>
  name.replace(/_ml$/, '');

/** UI-категории алгоритмов. */
export type AlgorithmCategory = 'exact' | 'heuristic' | 'ml';

const EXACT_BASES = new Set(['brute_force', 'dynamic_programming', 'hungarian']);
const HEURISTIC_BASES = new Set(['greedy', 'genetic', 'simulated_annealing']);

export function categoryOf(name: string): AlgorithmCategory {
  if (isMlAlgorithm(name)) return 'ml';
  if (EXACT_BASES.has(name)) return 'exact';
  if (HEURISTIC_BASES.has(name)) return 'heuristic';
  // Fallback: считаем эвристикой, чтобы не терять алгоритм в группировке
  return 'heuristic';
}

export const CATEGORY_LABEL: Record<AlgorithmCategory, string> = {
  exact: 'Точные',
  heuristic: 'Эвристические',
  ml: 'ML-усиленные',
};

export interface AlgorithmGroups {
  exact: AlgorithmInfo[];
  heuristic: AlgorithmInfo[];
  ml: AlgorithmInfo[];
}

export function groupAlgorithms(list: AlgorithmInfo[]): AlgorithmGroups {
  const groups: AlgorithmGroups = { exact: [], heuristic: [], ml: [] };
  for (const a of list) groups[categoryOf(a.name)].push(a);
  return groups;
}

/**
 * Находит все пары (base, base_ml), где обе версии присутствуют в списке.
 * Используется для быстрых сценариев сравнения.
 */
export function findMlPairs(list: AlgorithmInfo[]): Array<{
  base: AlgorithmInfo;
  ml: AlgorithmInfo;
}> {
  const byName = new Map(list.map((a) => [a.name, a]));
  const pairs: Array<{ base: AlgorithmInfo; ml: AlgorithmInfo }> = [];
  for (const a of list) {
    if (!isMlAlgorithm(a.name)) continue;
    const base = byName.get(baseAlgorithmName(a.name));
    if (base) pairs.push({ base, ml: a });
  }
  return pairs;
}

export function countMl(list: AlgorithmInfo[]): number {
  return list.filter((a) => isMlAlgorithm(a.name)).length;
}

/* ───── Аналитика результатов сравнения ───── */

export type Optimization = 'minimize' | 'maximize';

/** Лучший результат по времени выполнения. */
export function bestByTime(
  results: AlgorithmResultResponse[],
): AlgorithmResultResponse | null {
  if (results.length === 0) return null;
  return results.reduce((acc, r) =>
    r.execution_time < acc.execution_time ? r : acc,
  );
}

/** Лучший результат по качеству с учётом направления оптимизации. */
export function bestByQuality(
  results: AlgorithmResultResponse[],
  optimization: Optimization,
): AlgorithmResultResponse | null {
  if (results.length === 0) return null;
  return results.reduce((acc, r) => {
    if (optimization === 'minimize') {
      return r.objective_value < acc.objective_value ? r : acc;
    }
    return r.objective_value > acc.objective_value ? r : acc;
  });
}

export interface PairDelta {
  baseName: string;
  base: AlgorithmResultResponse;
  ml: AlgorithmResultResponse;
  /** Положительное значение = ML быстрее base. Доля (0.28 = +28%). */
  speedup: number;
  /** Положительное значение = ML лучше по качеству. Доля. */
  qualityDelta: number;
  /** Качество не ухудшилось (с учётом направления оптимизации). */
  qualityPreserved: boolean;
}

/**
 * Находит пары (base, base_ml) среди результатов и считает дельты:
 * прирост скорости и изменение качества с учётом направления оптимизации.
 */
export function computePairDeltas(
  results: AlgorithmResultResponse[],
  optimization: Optimization,
  qualityTolerance = 0.005,
): PairDelta[] {
  const byName = new Map(results.map((r) => [r.algorithm_name, r]));
  const deltas: PairDelta[] = [];
  for (const r of results) {
    if (!isMlAlgorithm(r.algorithm_name)) continue;
    const baseName = baseAlgorithmName(r.algorithm_name);
    const base = byName.get(baseName);
    if (!base) continue;

    const speedup =
      base.execution_time > 0
        ? (base.execution_time - r.execution_time) / base.execution_time
        : 0;

    let qualityDelta = 0;
    if (Math.abs(base.objective_value) > 1e-12) {
      const raw = (r.objective_value - base.objective_value) / Math.abs(base.objective_value);
      // Для minimize меньше = лучше → инвертируем знак, чтобы "положительное = лучше".
      qualityDelta = optimization === 'minimize' ? -raw : raw;
    }

    const qualityPreserved = qualityDelta >= -qualityTolerance;

    deltas.push({
      baseName,
      base,
      ml: r,
      speedup,
      qualityDelta,
      qualityPreserved,
    });
  }
  return deltas;
}

/** Признак "приближённого" ML-результата (когда оптимум не гарантирован). */
export function isApproximate(r: AlgorithmResultResponse): boolean {
  return r.ml_metrics?.optimality_guaranteed === false;
}

export interface ComparisonInsights {
  bestTime: AlgorithmResultResponse | null;
  bestQuality: AlgorithmResultResponse | null;
  pairDeltas: PairDelta[];
  /** Краткие текстовые выводы для summary-блока. */
  highlights: Array<{ kind: 'success' | 'info' | 'warning'; text: string }>;
}

const fmtPct = (v: number, digits = 1) =>
  `${v >= 0 ? '+' : ''}${(v * 100).toFixed(digits)}%`;

export function buildInsights(
  results: AlgorithmResultResponse[],
  optimization: Optimization,
): ComparisonInsights {
  const bestTime = bestByTime(results);
  const bestQuality = bestByQuality(results, optimization);
  const pairDeltas = computePairDeltas(results, optimization);

  const highlights: ComparisonInsights['highlights'] = [];

  for (const d of pairDeltas) {
    if (d.speedup > 0.05 && d.qualityPreserved) {
      highlights.push({
        kind: 'success',
        text: `${d.ml.display_name} быстрее ${d.base.display_name} на ${fmtPct(
          d.speedup,
        )}, качество не ухудшилось${
          Math.abs(d.qualityDelta) > 0.001
            ? ` (Δ качества ${fmtPct(d.qualityDelta, 2)})`
            : ''
        }.`,
      });
    } else if (d.speedup > 0.05 && !d.qualityPreserved) {
      highlights.push({
        kind: 'warning',
        text: `${d.ml.display_name} быстрее ${d.base.display_name} на ${fmtPct(
          d.speedup,
        )}, но качество хуже на ${fmtPct(-d.qualityDelta, 2)}.`,
      });
    } else if (d.speedup < -0.05) {
      highlights.push({
        kind: 'info',
        text: `${d.ml.display_name} медленнее ${d.base.display_name} на ${fmtPct(
          -d.speedup,
        )} — на этом размере задачи surrogate-модель не даёт ускорения.`,
      });
    } else {
      highlights.push({
        kind: 'info',
        text: `${d.ml.display_name} ≈ ${d.base.display_name} по времени (Δ ${fmtPct(
          d.speedup,
        )}), Δ качества ${fmtPct(d.qualityDelta, 2)}.`,
      });
    }
  }

  // Предупреждение о приближённых ML-вариантах среди лидеров качества
  const approximateLeaders = results
    .filter(isApproximate)
    .filter((r) => bestQuality && r.algorithm_name === bestQuality.algorithm_name);
  for (const r of approximateLeaders) {
    highlights.push({
      kind: 'warning',
      text: `${r.display_name} лидирует по качеству, но является приближённым ML-вариантом и не гарантирует глобальный оптимум.`,
    });
  }

  return { bestTime, bestQuality, pairDeltas, highlights };
}
