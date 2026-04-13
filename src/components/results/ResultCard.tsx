import type { SolveResponse } from '../../types';

interface Props {
  result: SolveResponse;
}

export default function ResultCard({ result }: Props) {
  const isML = result.algorithm_name?.includes('_ml');

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold">{result.display_name}</h3>
        {isML && (
          <span className="px-2 py-0.5 bg-violet-600/20 text-violet-400 rounded text-xs font-medium">
            🧠 ML
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Значение ЦФ</p>
          <p className="text-xl font-bold text-blue-400">
            {typeof result.objective_value === 'number'
              ? result.objective_value.toFixed(4)
              : result.objective_value}
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Время</p>
          <p className="text-xl font-bold text-emerald-400">
            {result.execution_time < 1
              ? `${(result.execution_time * 1000).toFixed(1)} мс`
              : `${result.execution_time.toFixed(3)} с`}
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Итерации</p>
          <p className="text-xl font-bold text-amber-400">
            {result.iterations ?? '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
