import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSolveHistory, deleteSolveHistory } from '../api/history';
import { extractErrorMessage } from '../api/client';
import { useTasks } from '../hooks/useTasks';
import type {
  SolveHistoryOut,
  SolveResponse,
  KnapsackItem,
  City,
} from '../types';
import Loader from '../components/Loader';
import ResultCard from '../components/results/ResultCard';
import MLMetricsCard from '../components/results/MLMetrics';
import SolveInterpretation from '../components/results/SolveInterpretation';
import ConvergenceChart from '../components/charts/ConvergenceChart';
import TspChart from '../components/charts/TspChart';
import KnapsackChart from '../components/charts/KnapsackChart';
import AssignmentVisualization from '../components/charts/AssignmentVisualization';

interface LocState {
  record?: SolveHistoryOut;
}

export default function HistorySolveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const location = useLocation();
  const navigate = useNavigate();
  const { getTask } = useTasks();

  const initial = (location.state as LocState | null)?.record;
  const [record, setRecord] = useState<SolveHistoryOut | null>(initial ?? null);
  const [loading, setLoading] = useState<boolean>(!initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record || Number.isNaN(numericId)) return;
    // Fallback: бэкенд не отдаёт одну запись, поэтому ищем в списке.
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let offset = 0;
        const pageSize = 100;
        for (;;) {
          const page = await getSolveHistory(pageSize, offset);
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
      await deleteSolveHistory(record.id);
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

  // Бэкенд хранит весь SolveResponse в `result`. Безопасно приводим.
  const result = record.result as unknown as SolveResponse;
  const inputData = (record.input_data ?? {}) as Record<string, unknown>;

  const task = getTask(record.task_name);
  const optimization = task?.optimization ?? 'minimize';

  // Достаём данные задачи для визуализации.
  const cities = Array.isArray(inputData.cities)
    ? (inputData.cities as City[])
    : [];
  const knapsackItems = Array.isArray(inputData.items)
    ? (inputData.items as KnapsackItem[])
    : [];
  const capacity =
    typeof inputData.capacity === 'number' ? inputData.capacity : 0;
  const costMatrix = Array.isArray(inputData.cost_matrix)
    ? (inputData.cost_matrix as number[][])
    : [];

  const convergence =
    Array.isArray(result?.convergence_history) ? result.convergence_history : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            to="/history"
            className="text-blue-400 hover:underline text-sm"
          >
            ← К истории
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            {result?.task_display_name ?? record.task_name}
          </h1>
          <p className="text-sm text-slate-400">
            {result?.display_name ?? record.algorithm} · #{record.id} ·{' '}
            {new Date(record.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="rounded bg-red-600 hover:bg-red-500 px-3 py-1.5 text-sm text-white"
        >
          Удалить
        </button>
      </div>

      {/* Result summary */}
      {result && typeof result.objective_value === 'number' ? (
        <ResultCard result={result} />
      ) : (
        <FallbackSummary record={record} />
      )}

      {result && (
        <SolveInterpretation result={result} optimization={optimization} />
      )}

      {result?.ml_metrics && <MLMetricsCard metrics={result.ml_metrics} />}

      {convergence.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-3 text-slate-800">
            График сходимости
          </h3>
          <ConvergenceChart
            data={convergence.map((v, i) => ({ iteration: i, value: v }))}
          />
        </div>
      )}

      {/* Task-specific visualization */}
      {record.task_name === 'tsp' && result?.visualization_data != null && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-3 text-slate-800">Маршрут</h3>
          <TspChart data={result.visualization_data} />
        </div>
      )}
      {record.task_name === 'knapsack' &&
        result?.solution != null &&
        knapsackItems.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-3 text-slate-800">Рюкзак</h3>
            <KnapsackChart
              items={knapsackItems}
              capacity={capacity}
              solution={result.solution as number[]}
            />
          </div>
        )}
      {record.task_name === 'assignment' &&
        result?.solution != null &&
        costMatrix.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-3 text-slate-800">
              Назначения
            </h3>
            <AssignmentVisualization
              matrix={costMatrix}
              solution={result.solution as number[]}
            />
          </div>
        )}

      {/* Дамп входных данных и параметров */}
      <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <summary className="cursor-pointer text-sm text-slate-300">
          Входные данные
        </summary>
        <pre className="mt-2 text-xs text-slate-300 bg-slate-900 rounded p-3 overflow-auto max-h-96">
          {JSON.stringify(inputData, null, 2)}
        </pre>
      </details>
      {record.params && Object.keys(record.params).length > 0 && (
        <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <summary className="cursor-pointer text-sm text-slate-300">
            Параметры алгоритма
          </summary>
          <pre className="mt-2 text-xs text-slate-300 bg-slate-900 rounded p-3 overflow-auto max-h-96">
            {JSON.stringify(record.params, null, 2)}
          </pre>
        </details>
      )}

      {/* Cities — на случай, если визуализации нет */}
      {cities.length > 0 && record.task_name === 'tsp' && (
        <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <summary className="cursor-pointer text-sm text-slate-300">
            Города ({cities.length})
          </summary>
          <pre className="mt-2 text-xs text-slate-300 bg-slate-900 rounded p-3 overflow-auto max-h-64">
            {JSON.stringify(cities, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

function FallbackSummary({ record }: { record: SolveHistoryOut }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 grid grid-cols-3 gap-4">
      <div className="bg-slate-900 rounded-lg p-3">
        <p className="text-xs text-slate-400 mb-1">Значение ЦФ</p>
        <p className="text-xl font-bold text-blue-400">
          {record.objective_value ?? '—'}
        </p>
      </div>
      <div className="bg-slate-900 rounded-lg p-3">
        <p className="text-xs text-slate-400 mb-1">Время, мс</p>
        <p className="text-xl font-bold text-emerald-400">
          {record.elapsed_ms ?? '—'}
        </p>
      </div>
      <div className="bg-slate-900 rounded-lg p-3">
        <p className="text-xs text-slate-400 mb-1">Алгоритм</p>
        <p className="text-base font-bold text-amber-400">{record.algorithm}</p>
      </div>
    </div>
  );
}
