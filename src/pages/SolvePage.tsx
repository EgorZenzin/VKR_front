import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { solve } from '../api';
import type { SolveResponse } from '../types';
import Loader from '../components/Loader';
import TspInput from '../components/inputs/TspInput';
import KnapsackInput from '../components/inputs/KnapsackInput';
import AssignmentInput from '../components/inputs/AssignmentInput';
import AlgorithmParams from '../components/inputs/AlgorithmParams';
import ResultCard from '../components/results/ResultCard';
import MLMetricsCard from '../components/results/MLMetrics';
import ConvergenceChart from '../components/charts/ConvergenceChart';
import TspChart from '../components/charts/TspChart';
import KnapsackChart from '../components/charts/KnapsackChart';
import AssignmentVisualization from '../components/charts/AssignmentVisualization';
import { generateCities, generateKnapsackItems, generateCostMatrix } from '../utils/generators';

export default function SolvePage() {
  const { taskName } = useParams<{ taskName: string }>();
  const { getTask, loading: tasksLoading } = useTasks();
  const task = getTask(taskName || '');

  const [algorithm, setAlgorithm] = useState('');
  const [params, setParams] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Input data state
  const [cities, setCities] = useState(() => generateCities(10));
  const [knapsackData] = useState(() => generateKnapsackItems(8));
  const [knapsackItems, setKnapsackItems] = useState(knapsackData.items);
  const [capacity, setCapacity] = useState(knapsackData.capacity);
  const [costMatrix, setCostMatrix] = useState(() => generateCostMatrix(4));

  const buildInputData = () => {
    switch (taskName) {
      case 'tsp':
        return { cities };
      case 'knapsack':
        return { items: knapsackItems, capacity };
      case 'assignment':
        return { cost_matrix: costMatrix };
      default:
        return {};
    }
  };

  const handleSolve = async () => {
    if (!algorithm) {
      setError('Выберите алгоритм');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await solve({
        task_name: taskName!,
        algorithm,
        input_data: buildInputData(),
        params: Object.keys(params).length > 0 ? params : undefined,
      });
      setResult(res);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (tasksLoading) return <Loader />;
  if (!task) return <div className="text-red-400">Задача «{taskName}» не найдена</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{task.display_name}</h1>
        {task.description && (
          <p className="text-slate-400 mt-1">{task.description}</p>
        )}
      </div>

      {/* Algorithm select */}
      <div className="bg-slate-800 rounded-lg p-4">
        <label className="block text-sm text-slate-400 mb-2">Алгоритм</label>
        <select
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="">— Выберите алгоритм —</option>
          {task.algorithms.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name.includes('_ml') ? '🧠 ' : ''}
              {a.display_name}
              {a.name.includes('_ml') ? ' [ML]' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Input data */}
      <div className="bg-slate-800 rounded-lg p-4">
        {taskName === 'tsp' && (
          <TspInput cities={cities} onChange={setCities} />
        )}
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

      {/* Params */}
      {algorithm && (
        <AlgorithmParams
          algorithm={algorithm}
          params={params}
          onChange={setParams}
        />
      )}

      {/* Solve button */}
      <button
        onClick={handleSolve}
        disabled={loading || !algorithm}
        className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Решаю...' : 'Решить'}
      </button>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-4">
          {error}
        </div>
      )}

      {loading && <Loader />}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <ResultCard result={result} />

          {result.ml_metrics && <MLMetricsCard metrics={result.ml_metrics} />}

          {result.convergence_history?.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">График сходимости</h3>
              <ConvergenceChart
                data={result.convergence_history.map((v, i) => ({
                  iteration: i,
                  value: v,
                }))}
              />
            </div>
          )}

          {/* Task-specific visualization */}
          {taskName === 'tsp' && result.visualization_data != null ? (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Маршрут</h3>
              <TspChart data={result.visualization_data} />
            </div>
          ) : null}

          {taskName === 'knapsack' && result.solution != null ? (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Рюкзак</h3>
              <KnapsackChart
                items={knapsackItems}
                capacity={capacity}
                solution={result.solution as number[]}
              />
            </div>
          ) : null}

          {taskName === 'assignment' && result.solution != null ? (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Назначения</h3>
              <AssignmentVisualization
                matrix={costMatrix}
                solution={result.solution as number[]}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
