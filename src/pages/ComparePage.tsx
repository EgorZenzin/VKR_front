import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { compare } from '../api';
import type { CompareResponse } from '../types';
import Loader from '../components/Loader';
import TspInput from '../components/inputs/TspInput';
import KnapsackInput from '../components/inputs/KnapsackInput';
import AssignmentInput from '../components/inputs/AssignmentInput';
import AlgorithmParams from '../components/inputs/AlgorithmParams';
import ConvergenceChart from '../components/charts/ConvergenceChart';
import { ComparisonBarChart, SurrogateRatioPie } from '../components/charts/ComparisonChart';
import { generateCities, generateKnapsackItems, generateCostMatrix } from '../utils/generators';

export default function ComparePage() {
  const { taskName } = useParams<{ taskName: string }>();
  const [searchParams] = useSearchParams();
  const { getTask, loading: tasksLoading } = useTasks();
  const task = getTask(taskName || '');

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

  // Apply preset from URL
  useEffect(() => {
    if (!task) return;
    const preset = searchParams.get('preset');
    if (preset === 'ml') {
      const mlAlgos = task.algorithms
        .filter((a) => a.name === 'genetic' || a.name === 'genetic_ml')
        .map((a) => a.name);
      setSelectedAlgos(mlAlgos);
    }
  }, [task, searchParams]);

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
    if (!task) return;
    switch (preset) {
      case 'all':
        setSelectedAlgos(task.algorithms.map((a) => a.name));
        break;
      case 'ml':
        setSelectedAlgos(
          task.algorithms
            .filter((a) => a.name === 'genetic' || a.name === 'genetic_ml')
            .map((a) => a.name),
        );
        break;
      case 'classic':
        setSelectedAlgos(
          task.algorithms.filter((a) => !a.name.includes('_ml')).map((a) => a.name),
        );
        break;
    }
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
      const res = await compare({
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

  const mlResults = result?.results.filter((r) => r.ml_metrics) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Сравнение: {task.display_name}
      </h1>

      {/* Algorithm selection */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">Алгоритмы</h3>
          <div className="flex gap-2">
            <button onClick={() => selectPreset('all')} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              Все
            </button>
            <button onClick={() => selectPreset('ml')} className="px-2 py-1 text-xs rounded bg-violet-700/50 hover:bg-violet-700 text-violet-300 transition-colors">
              ML vs Без ML
            </button>
            <button onClick={() => selectPreset('classic')} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              Только классические
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {task.algorithms.map((a) => {
            const isML = a.name.includes('_ml');
            const checked = selectedAlgos.includes(a.name);
            return (
              <label
                key={a.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                  checked
                    ? isML
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
                {isML && <span>🧠</span>}
                <span className="text-sm">{a.display_name}</span>
              </label>
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
            {task.algorithms.find((a) => a.name === algoName)?.display_name}
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
      {result && (
        <div className="space-y-6">
          {/* Results table */}
          <div className="bg-slate-800 rounded-lg p-4 overflow-auto">
            <h3 className="text-lg font-semibold mb-3">Результаты</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Алгоритм</th>
                  <th className="text-right py-2">Значение ЦФ</th>
                  <th className="text-right py-2">Время</th>
                  <th className="text-right py-2">Итерации</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => {
                  const isML = r.algorithm_name?.includes('_ml');
                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-700/50 ${
                        isML ? 'bg-violet-600/10' : ''
                      }`}
                    >
                      <td className="py-2">
                        {isML && <span className="mr-1">🧠</span>}
                        {r.display_name}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {r.objective_value?.toFixed(4)}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {r.execution_time < 1
                          ? `${(r.execution_time * 1000).toFixed(1)} мс`
                          : `${r.execution_time.toFixed(3)} с`}
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

          {/* ML metrics table */}
          {mlResults.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-violet-600/30 overflow-auto">
              <h3 className="text-lg font-semibold mb-3">🧠 ML-метрики</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2">Алгоритм</th>
                    <th className="text-right py-2">Точные оценки</th>
                    <th className="text-right py-2">Суррогатные</th>
                    <th className="text-right py-2">R²</th>
                    <th className="text-right py-2">Обуч. сэмплов</th>
                  </tr>
                </thead>
                <tbody>
                  {mlResults.map((r, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-2">{r.display_name}</td>
                      <td className="py-2 text-right font-mono">
                        {r.ml_metrics!.exact_evaluations}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {r.ml_metrics!.surrogate_evaluations}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {r.ml_metrics!.surrogate_accuracy_r2.toFixed(3)}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {r.ml_metrics!.training_samples}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Convergence chart */}
          {result.comparison_charts?.convergence?.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Сходимость</h3>
              <ConvergenceChart series={result.comparison_charts.convergence} />
            </div>
          )}

          {/* Bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.comparison_charts?.time_comparison && (
              <div className="bg-slate-800 rounded-lg p-4">
                <ComparisonBarChart
                  title="Сравнение времени"
                  comparison={result.comparison_charts.time_comparison}
                  unit="Время (с)"
                  results={result.results}
                />
              </div>
            )}
            {result.comparison_charts?.quality_comparison && (
              <div className="bg-slate-800 rounded-lg p-4">
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
          {mlResults.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-violet-600/30">
              <h3 className="text-lg font-semibold mb-3">Доля суррогатных оценок</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mlResults.map((r) => (
                  <div key={r.algorithm_name}>
                    <p className="text-sm text-slate-400 text-center mb-2">
                      {r.display_name}
                    </p>
                    <SurrogateRatioPie
                      exact={r.ml_metrics!.exact_evaluations}
                      surrogate={r.ml_metrics!.surrogate_evaluations}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
