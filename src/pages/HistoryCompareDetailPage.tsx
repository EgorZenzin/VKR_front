import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCompareHistory, deleteCompareHistory } from '../api/history';
import { extractErrorMessage } from '../api/client';
import { useTasks } from '../hooks/useTasks';
import type {
  ComparisonHistoryOut,
  CompareResponse,
  AlgorithmResultResponse,
} from '../types';
import Loader from '../components/Loader';
import ConvergenceChart from '../components/charts/ConvergenceChart';
import {
  ComparisonBarChart,
  SurrogateRatioPie,
} from '../components/charts/ComparisonChart';
import {
  isMlAlgorithm,
  isApproximate,
  categoryOf,
} from '../utils/algorithms';

interface LocState {
  record?: ComparisonHistoryOut;
}

const fmtTime = (t: number) =>
  t < 1 ? `${(t * 1000).toFixed(1)} мс` : `${t.toFixed(3)} с`;

const CATEGORY_BADGE: Record<
  'exact' | 'heuristic' | 'ml',
  { label: string; cls: string }
> = {
  exact: { label: 'Точный', cls: 'bg-emerald-600/20 text-emerald-300' },
  heuristic: { label: 'Эвристика', cls: 'bg-blue-600/20 text-blue-300' },
  ml: { label: 'ML', cls: 'bg-violet-600/20 text-violet-300' },
};

export default function HistoryCompareDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const location = useLocation();
  const navigate = useNavigate();
  const { getTask } = useTasks();

  const initial = (location.state as LocState | null)?.record;
  const [record, setRecord] = useState<ComparisonHistoryOut | null>(
    initial ?? null,
  );
  const [loading, setLoading] = useState<boolean>(!initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record || Number.isNaN(numericId)) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let offset = 0;
        const pageSize = 100;
        for (;;) {
          const page = await getCompareHistory(pageSize, offset);
          const found = page.find((r) => r.id === numericId);
          if (found) {
            if (!cancelled) setRecord(found);
            return;
          }
          if (page.length < pageSize) break;
          offset += pageSize;
          if (offset > 5000) break;
        }
        if (!cancelled) setError('Запись не найдена');
      } catch (e) {
        if (!cancelled) setError(extractErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericId, record]);

  const onDelete = async () => {
    if (!record) return;
    if (!confirm('Удалить эту запись из истории?')) return;
    try {
      await deleteCompareHistory(record.id);
      navigate('/history', { replace: true });
    } catch (e) {
      alert(extractErrorMessage(e));
    }
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/history" className="text-blue-400 hover:underline text-sm">
          ← К истории
        </Link>
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded p-3">
          {error}
        </div>
      </div>
    );
  }
  if (!record) return null;

  const result = record.result as unknown as CompareResponse;
  const task = getTask(record.task_name);
  const results: AlgorithmResultResponse[] = Array.isArray(result?.results)
    ? result.results
    : [];
  const charts = result?.comparison_charts;
  const mlResults = results.filter((r) => r.ml_metrics);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            to="/history"
            className="text-blue-400 hover:underline text-sm"
          >
            ← К истории
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            Сравнение: {result?.task_display_name ?? task?.display_name ?? record.task_name}
          </h1>
          <p className="text-sm text-slate-400">
            #{record.id} · {new Date(record.created_at).toLocaleString()} ·{' '}
            алгоритмов: {record.algorithms_count}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="rounded bg-red-600 hover:bg-red-500 px-3 py-1.5 text-sm text-white"
        >
          Удалить
        </button>
      </div>

      {/* Results table */}
      {results.length > 0 && (
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
              {results.map((r, i) => {
                const ml = isMlAlgorithm(r.algorithm_name ?? '');
                const cat = categoryOf(r.algorithm_name);
                const cb = CATEGORY_BADGE[cat];
                const approx = isApproximate(r);
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${cb.cls}`}>
                        {cb.label}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono">
                      {typeof r.objective_value === 'number'
                        ? r.objective_value.toFixed(4)
                        : '—'}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {typeof r.execution_time === 'number'
                        ? fmtTime(r.execution_time)
                        : '—'}
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
      )}

      {/* Convergence */}
      {charts?.convergence && charts.convergence.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-3 text-slate-800">
            Сходимость
          </h3>
          <ConvergenceChart series={charts.convergence} />
        </div>
      )}

      {/* Bar charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts?.time_comparison && (
          <div className="bg-white rounded-lg p-4 shadow">
            <ComparisonBarChart
              title="Сравнение времени"
              comparison={charts.time_comparison}
              unit="Время (с)"
              results={results}
            />
          </div>
        )}
        {charts?.quality_comparison && (
          <div className="bg-white rounded-lg p-4 shadow">
            <ComparisonBarChart
              title="Сравнение качества"
              comparison={charts.quality_comparison}
              unit="Значение ЦФ"
              results={results}
            />
          </div>
        )}
      </div>

      {/* Surrogate pies */}
      {mlResults.some(
        (r) =>
          ((r.ml_metrics?.exact_evaluations as number) ?? 0) +
            ((r.ml_metrics?.surrogate_evaluations as number) ?? 0) >
          0,
      ) && (
        <div className="bg-white rounded-lg p-4 shadow border border-violet-200">
          <h3 className="text-lg font-semibold mb-3 text-slate-800">
            Доля суррогатных оценок
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mlResults.map((r) => {
              const exact =
                (r.ml_metrics?.exact_evaluations as number) ?? 0;
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

      {/* Raw blocks */}
      <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <summary className="cursor-pointer text-sm text-slate-300">
          Входные данные
        </summary>
        <pre className="mt-2 text-xs text-slate-300 bg-slate-900 rounded p-3 overflow-auto max-h-96">
          {JSON.stringify(record.input_data, null, 2)}
        </pre>
      </details>
      {record.params && Object.keys(record.params).length > 0 && (
        <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <summary className="cursor-pointer text-sm text-slate-300">
            Параметры алгоритмов
          </summary>
          <pre className="mt-2 text-xs text-slate-300 bg-slate-900 rounded p-3 overflow-auto max-h-96">
            {JSON.stringify(record.params, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
