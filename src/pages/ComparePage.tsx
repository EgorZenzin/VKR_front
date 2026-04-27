import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { compareTasks, getTaskAlgorithms } from '../api';
import type { CompareResponse, AlgorithmInfo, MLMetrics } from '../types';
import Loader from '../components/Loader';
import TspInput from '../components/inputs/TspInput';
import KnapsackInput from '../components/inputs/KnapsackInput';
import AssignmentInput from '../components/inputs/AssignmentInput';
import AlgorithmParams from '../components/inputs/AlgorithmParams';
import ConvergenceChart from '../components/charts/ConvergenceChart';
import { ComparisonBarChart, SurrogateRatioPie } from '../components/charts/ComparisonChart';
import { generateCities, generateKnapsackItems, generateCostMatrix } from '../utils/generators';
import {
  isMlAlgorithm,
  groupAlgorithms,
  CATEGORY_LABEL,
  findMlPairs,
  buildInsights,
  isApproximate,
  categoryOf,
} from '../utils/algorithms';
import type { ComparisonInsights } from '../utils/algorithms';

// Базовые алгоритмы, для которых имеет смысл быстрый сценарий "base vs base_ml".
// Для каждого указано, в каких задачах он применим (undefined = во всех, где обе версии есть).
const QUICK_PAIR_BASES: Array<{ base: string; tasks?: string[] }> = [
  { base: 'greedy' },
  { base: 'genetic' },
  { base: 'brute_force' },
  { base: 'simulated_annealing', tasks: ['tsp'] },
];

export default function ComparePage() {
  const { taskName } = useParams<{ taskName: string }>();
  const [searchParams] = useSearchParams();
  const { getTask, loading: tasksLoading } = useTasks();
  const task = getTask(taskName || '');

  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [algosLoading, setAlgosLoading] = useState(false);
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([]);
  const [algoParams, setAlgoParams] = useState<Record<string, Record<string, number>>>({});
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Input data state
  const [cities, setCities] = useState(() => generateCities(10));
  const [knapsackData] = useState(() => generateKnapsackItems(8));
  const [knapsackItems, setKnapsackItems] = useState(knapsackData.items);
  const [capacity, setCapacity] = useState(knapsackData.capacity);
  const [costMatrix, setCostMatrix] = useState(() => generateCostMatrix(4));

  // Динамическая загрузка алгоритмов задачи через GET /tasks/{name}/algorithms
  useEffect(() => {
    if (!taskName) return;
    setAlgosLoading(true);
    getTaskAlgorithms(taskName)
      .then(setAlgorithms)
      .catch(() => setAlgorithms(task?.algorithms ?? []))
      .finally(() => setAlgosLoading(false));
    setSelectedAlgos([]);
    setAlgoParams({});
    setResult(null);
  }, [taskName, task]);

  // Apply preset from URL после загрузки списка алгоритмов
  useEffect(() => {
    if (algorithms.length === 0) return;
    const preset = searchParams.get('preset');
    if (preset === 'ml') {
      const pairs = findMlPairs(algorithms);
      const names = new Set<string>();
      pairs.forEach((p) => {
        names.add(p.base.name);
        names.add(p.ml.name);
      });
      if (names.size >= 2) setSelectedAlgos(Array.from(names));
    }
  }, [algorithms, searchParams]);

  const buildInputData = () => {
    switch (taskName) {
      case 'tsp': return { cities };
      case 'knapsack': return { items: knapsackItems, capacity };
      case 'assignment': return { cost_matrix: costMatrix };
      default: return {};
    }
  };

  const toggleAlgo = (name: string) => {
    setSelectedAlgos((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    );
  };

  const selectPreset = (preset: 'all' | 'ml' | 'classic') => {
    if (algorithms.length === 0) return;
    switch (preset) {
      case 'all':
        setSelectedAlgos(algorithms.map((a) => a.name));
        break;
      case 'ml': {
        const pairs = findMlPairs(algorithms);
        const names = new Set<string>();
        pairs.forEach((p) => {
          names.add(p.base.name);
          names.add(p.ml.name);
        });
        setSelectedAlgos(Array.from(names));
        break;
      }
      case 'classic':
        setSelectedAlgos(
          algorithms.filter((a) => !isMlAlgorithm(a.name)).map((a) => a.name),
        );
        break;
    }
  };

  const selectQuickPair = (base: string) => {
    const baseAlgo = algorithms.find((a) => a.name === base);
    const mlAlgo = algorithms.find((a) => a.name === `${base}_ml`);
    if (baseAlgo && mlAlgo) setSelectedAlgos([baseAlgo.name, mlAlgo.name]);
  };

  const handleCompare = async () => {
    if (selectedAlgos.length < 2) {
      setError('Выберите минимум 2 алгоритма');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const params: Record<string, Record<string, number>> = {};
      selectedAlgos.forEach((a) => {
        if (algoParams[a] && Object.keys(algoParams[a]).length > 0) {
          params[a] = algoParams[a];
        }
      });
      const res = await compareTasks({
        task_name: taskName!,
        algorithms: selectedAlgos,
        input_data: buildInputData(),
        params: Object.keys(params).length > 0 ? params : undefined,
      });
      setResult(res);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Ошибка сравнения');
    } finally {
      setLoading(false);
    }
  };

  if (tasksLoading) return <Loader />;
  if (!task) return <div className="text-red-400">Задача «{taskName}» не найдена</div>;

  const groups = groupAlgorithms(algorithms);
  const mlResults = result?.results.filter((r) => r.ml_metrics) || [];
  const insights = result
    ? buildInsights(result.results, task.optimization)
    : null;

  // Сценарии "base vs base_ml", доступные для текущей задачи
  const availableQuickPairs = QUICK_PAIR_BASES.filter(({ base, tasks }) => {
    if (tasks && taskName && !tasks.includes(taskName)) return false;
    return (
      algorithms.some((a) => a.name === base) &&
      algorithms.some((a) => a.name === `${base}_ml`)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Сравнение: {task.display_name}
      </h1>

      {/* Algorithm selection */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-slate-300">
            Алгоритмы{algosLoading && ' (загрузка...)'}
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => selectPreset('all')} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              Все
            </button>
            <button onClick={() => selectPreset('ml')} className="px-2 py-1 text-xs rounded bg-violet-700/50 hover:bg-violet-700 text-violet-300 transition-colors">
              ML vs Без ML
            </button>
            <button onClick={() => selectPreset('classic')} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              Только классические
            </button>
            <button onClick={() => setSelectedAlgos([])} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              Очистить
            </button>
          </div>
        </div>

        {/* Быстрые сценарии: base vs base_ml */}
        {availableQuickPairs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Быстрые сценарии:</p>
            <div className="flex flex-wrap gap-2">
              {availableQuickPairs.map(({ base }) => {
                const baseAlgo = algorithms.find((a) => a.name === base);
                const mlAlgo = algorithms.find((a) => a.name === `${base}_ml`);
                return (
                  <button
                    key={base}
                    onClick={() => selectQuickPair(base)}
                    className="px-3 py-1 text-xs rounded-full bg-violet-600/20 hover:bg-violet-600/40 border border-violet-600/40 text-violet-200 transition-colors"
                  >
                    {baseAlgo?.display_name} vs 🧠 {mlAlgo?.display_name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Группы по категориям */}
        <div className="space-y-3">
          {(['exact', 'heuristic', 'ml'] as const).map((cat) => {
            const list = groups[cat];
            if (list.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs text-slate-500 mb-1">
                  {CATEGORY_LABEL[cat]}
                </p>
                <div className="flex flex-wrap gap-3">
                  {list.map((a) => {
                    const ml = isMlAlgorithm(a.name);
                    const checked = selectedAlgos.includes(a.name);
                    return (
                      <label
                        key={a.name}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                          checked
                            ? ml
                              ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                              : 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAlgo(a.name)}
                          className="accent-blue-500"
                        />
                        {ml && <span>🧠</span>}
                        <span className="text-sm">{a.display_name}</span>
                        {ml && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-violet-600/30 text-violet-200 rounded">
                            ML
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input data */}
      <div className="bg-slate-800 rounded-lg p-4">
        {taskName === 'tsp' && <TspInput cities={cities} onChange={setCities} />}
        {taskName === 'knapsack' && (
          <KnapsackInput
            items={knapsackItems}
            capacity={capacity}
            onChangeItems={setKnapsackItems}
            onChangeCapacity={setCapacity}
          />
        )}
        {taskName === 'assignment' && (
          <AssignmentInput matrix={costMatrix} onChange={setCostMatrix} />
        )}
      </div>

      {/* Per-algorithm params */}
      {selectedAlgos.map((algoName) => (
        <div key={algoName}>
          <p className="text-xs text-slate-500 mb-1">
            {algorithms.find((a) => a.name === algoName)?.display_name}
            {isMlAlgorithm(algoName) && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-violet-600/30 text-violet-200 rounded">
                ML
              </span>
            )}
          </p>
          <AlgorithmParams
            algorithm={algoName}
            params={algoParams[algoName] || {}}
            onChange={(p) => setAlgoParams((prev) => ({ ...prev, [algoName]: p }))}
          />
        </div>
      ))}

      {/* Compare button */}
      <button
        onClick={handleCompare}
        disabled={loading || selectedAlgos.length < 2}
        className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Сравниваю...' : 'Сравнить'}
      </button>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-4">
          {error}
        </div>
      )}

      {loading && <Loader />}

      {/* Results */}
      {result && insights && (
        <div className="space-y-6">
          {/* Summary / insights block */}
          <SummaryBlock
            insights={insights}
            optimization={task.optimization}
          />

          {/* Results table */}
          <div className="bg-slate-800 rounded-lg p-4 overflow-auto">
            <h3 className="text-lg font-semibold mb-3">Результаты</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Алгоритм</th>
                  <th className="text-left py-2">Класс</th>
                  <th className="text-right py-2">Значение ЦФ</th>
                  <th className="text-right py-2">Время</th>
                  <th className="text-right py-2">Итерации</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => {
                  const ml = isMlAlgorithm(r.algorithm_name ?? '');
                  const isBestTime =
                    insights.bestTime?.algorithm_name === r.algorithm_name;
                  const isBestQuality =
                    insights.bestQuality?.algorithm_name === r.algorithm_name;
                  const approx = isApproximate(r);
                  const cat = categoryOf(r.algorithm_name);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-700/50 ${
                        ml ? 'bg-violet-600/10' : ''
                      }`}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {ml && <span>🧠</span>}
                          <span>{r.display_name}</span>
                          {ml && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-violet-600/30 text-violet-200 rounded">
                              ML
                            </span>
                          )}
                          {approx && (
                            <span
                              title="Не гарантирует глобальный оптимум"
                              className="text-[10px] px-1.5 py-0.5 bg-amber-600/30 text-amber-200 rounded"
                            >
                              приближённый
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        <CategoryBadge category={cat} />
                      </td>
                      <td className="py-2 text-right font-mono">
                        <span
                          className={
                            isBestQuality
                              ? 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-300'
                              : ''
                          }
                        >
                          {isBestQuality && <span>🎯</span>}
                          {r.objective_value?.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono">
                        <span
                          className={
                            isBestTime
                              ? 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300'
                              : ''
                          }
                        >
                          {isBestTime && <span>🏆</span>}
                          {r.execution_time < 1
                            ? `${(r.execution_time * 1000).toFixed(1)} мс`
                            : `${r.execution_time.toFixed(3)} с`}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {r.iterations ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ML metrics: expandable per-result */}
          {mlResults.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-violet-600/30 space-y-3">
              <h3 className="text-lg font-semibold">🧠 ML-метрики</h3>
              {mlResults.map((r) => (
                <details
                  key={r.algorithm_name}
                  className="bg-slate-900/60 rounded p-3 border border-slate-700"
                  open
                >
                  <summary className="cursor-pointer font-semibold text-violet-300 flex items-center gap-2">
                    <span>{r.display_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-600/30 text-violet-200 rounded">
                      ML
                    </span>
                    {r.ml_metrics?.optimality_guaranteed === false && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-600/30 text-amber-200 rounded">
                        приближённый
                      </span>
                    )}
                  </summary>
                  <div className="mt-2">
                    <MLMetricsList metrics={r.ml_metrics!} />
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Convergence chart */}
          {result.comparison_charts?.convergence?.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Сходимость</h3>
              <ConvergenceChart series={result.comparison_charts.convergence} />
            </div>
          )}

          {/* Bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.comparison_charts?.time_comparison && (
              <div className="bg-white rounded-lg p-4 shadow">
                <ComparisonBarChart
                  title="Сравнение времени"
                  comparison={result.comparison_charts.time_comparison}
                  unit="Время (с)"
                  results={result.results}
                />
              </div>
            )}
            {result.comparison_charts?.quality_comparison && (
              <div className="bg-white rounded-lg p-4 shadow">
                <ComparisonBarChart
                  title="Сравнение качества"
                  comparison={result.comparison_charts.quality_comparison}
                  unit="Значение ЦФ"
                  results={result.results}
                />
              </div>
            )}
          </div>

          {/* Surrogate pie charts */}
          {mlResults.some(
            (r) =>
              ((r.ml_metrics?.exact_evaluations as number) ?? 0) +
                ((r.ml_metrics?.surrogate_evaluations as number) ?? 0) >
              0,
          ) && (
            <div className="bg-white rounded-lg p-4 shadow border border-violet-200">
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Доля суррогатных оценок</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mlResults.map((r) => {
                  const exact = (r.ml_metrics?.exact_evaluations as number) ?? 0;
                  const surrogate =
                    (r.ml_metrics?.surrogate_evaluations as number) ?? 0;
                  if (exact + surrogate === 0) return null;
                  return (
                    <div key={r.algorithm_name}>
                      <p className="text-sm text-slate-400 text-center mb-2">
                        {r.display_name}
                      </p>
                      <SurrogateRatioPie exact={exact} surrogate={surrogate} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Универсальный список ML-метрик: выводит все ключи, пришедшие с backend. */
function MLMetricsList({ metrics }: { metrics: MLMetrics }) {
  const entries = Object.entries(metrics).filter(
    ([, v]) => v !== null && v !== undefined && typeof v !== 'object',
  );
  if (entries.length === 0) {
    return <p className="text-xs text-slate-500">Нет дополнительных метрик</p>;
  }
  const fmt = (k: string, v: unknown): string => {
    if (typeof v === 'boolean') return v ? 'да' : 'нет';
    if (typeof v === 'number') {
      if (k === 'surrogate_ratio') return `${(v * 100).toFixed(1)}%`;
      if (!Number.isInteger(v)) return v.toFixed(4);
      return String(v);
    }
    return String(v);
  };
  const labelize = (k: string) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="bg-slate-800/60 rounded px-2 py-1">
          <span className="text-slate-500">{labelize(k)}: </span>
          <span className="text-slate-200 font-mono">{fmt(k, v)}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── Summary / insights ───── */

const fmtPct = (v: number, digits = 1) =>
  `${v >= 0 ? '+' : ''}${(v * 100).toFixed(digits)}%`;

const fmtTime = (t: number) =>
  t < 1 ? `${(t * 1000).toFixed(1)} мс` : `${t.toFixed(3)} с`;

function SummaryBlock({
  insights,
  optimization,
}: {
  insights: ComparisonInsights;
  optimization: 'minimize' | 'maximize';
}) {
  const { bestTime, bestQuality, pairDeltas, highlights } = insights;
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📊 Итоги сравнения</h3>
        <span className="text-xs text-slate-500">
          цель: {optimization === 'minimize' ? 'минимизация' : 'максимизация'}
        </span>
      </div>

      {/* Winner cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {bestTime && (
          <WinnerCard
            icon="🏆"
            label="Лучшее время"
            primary={bestTime.display_name}
            secondary={fmtTime(bestTime.execution_time)}
            accent="border-blue-500/40 bg-blue-500/5"
            ml={isMlAlgorithm(bestTime.algorithm_name)}
            approximate={isApproximate(bestTime)}
          />
        )}
        {bestQuality && (
          <WinnerCard
            icon="🎯"
            label="Лучшее качество"
            primary={bestQuality.display_name}
            secondary={`ЦФ = ${bestQuality.objective_value.toFixed(4)}`}
            accent="border-emerald-500/40 bg-emerald-500/5"
            ml={isMlAlgorithm(bestQuality.algorithm_name)}
            approximate={isApproximate(bestQuality)}
          />
        )}
        {pairDeltas.length > 0 && (
          <WinnerCard
            icon="⚡"
            label="Наибольшее ускорение ML"
            primary={(() => {
              const best = pairDeltas.reduce((a, b) =>
                b.speedup > a.speedup ? b : a,
              );
              return `${best.ml.display_name} vs ${best.base.display_name}`;
            })()}
            secondary={(() => {
              const best = pairDeltas.reduce((a, b) =>
                b.speedup > a.speedup ? b : a,
              );
              return `${fmtPct(best.speedup)} по времени`;
            })()}
            accent="border-violet-500/40 bg-violet-500/5"
          />
        )}
      </div>

      {/* Pair deltas table */}
      {pairDeltas.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">
            Сравнение пар «классика → ML»
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pairDeltas.map((d) => {
              const speedupColor =
                d.speedup > 0.05
                  ? 'text-emerald-300'
                  : d.speedup < -0.05
                    ? 'text-rose-300'
                    : 'text-slate-300';
              const qualityColor = d.qualityPreserved
                ? 'text-emerald-300'
                : 'text-amber-300';
              return (
                <div
                  key={d.baseName}
                  className="bg-slate-900/60 rounded border border-slate-700 px-3 py-2 text-sm flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-slate-300 truncate">
                      {d.base.display_name}{' '}
                      <span className="text-slate-500">→</span> 🧠{' '}
                      {d.ml.display_name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {fmtTime(d.base.execution_time)} →{' '}
                      {fmtTime(d.ml.execution_time)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-mono text-xs ${speedupColor}`}>
                      ⚡ {fmtPct(d.speedup)}
                    </div>
                    <div className={`font-mono text-xs ${qualityColor}`}>
                      🎯 {fmtPct(d.qualityDelta, 2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="space-y-1.5">
          {highlights.map((h, i) => {
            const cls =
              h.kind === 'success'
                ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-200'
                : h.kind === 'warning'
                  ? 'bg-amber-900/30 border-amber-700/40 text-amber-200'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300';
            const icon =
              h.kind === 'success' ? '✅' : h.kind === 'warning' ? '⚠️' : 'ℹ️';
            return (
              <div
                key={i}
                className={`text-sm rounded border px-3 py-2 ${cls}`}
              >
                <span className="mr-2">{icon}</span>
                {h.text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WinnerCard({
  icon,
  label,
  primary,
  secondary,
  accent,
  ml,
  approximate,
}: {
  icon: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  ml?: boolean;
  approximate?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${accent}`}>
      <div className="text-xs text-slate-400 flex items-center gap-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
        {ml && <span>🧠</span>}
        <span className="truncate">{primary}</span>
        {ml && (
          <span className="text-[10px] px-1.5 py-0.5 bg-violet-600/30 text-violet-200 rounded">
            ML
          </span>
        )}
        {approximate && (
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-600/30 text-amber-200 rounded">
            приближённый
          </span>
        )}
      </div>
      <div className="text-sm font-mono text-slate-300 mt-0.5">{secondary}</div>
    </div>
  );
}

function CategoryBadge({
  category,
}: {
  category: 'exact' | 'heuristic' | 'ml';
}) {
  const map = {
    exact: { label: 'Точный', cls: 'bg-emerald-600/20 text-emerald-300' },
    heuristic: { label: 'Эвристика', cls: 'bg-blue-600/20 text-blue-300' },
    ml: { label: 'ML', cls: 'bg-violet-600/20 text-violet-300' },
  } as const;
  const { label, cls } = map[category];
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${cls}`}>{label}</span>
  );
}

