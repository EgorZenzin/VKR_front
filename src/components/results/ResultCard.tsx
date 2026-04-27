import type { SolveResponse } from '../../types';
import { categoryOf, isApproximate, isMlAlgorithm } from '../../utils/algorithms';

interface Props {
  result: SolveResponse;
}

const CATEGORY_BADGE: Record<
  'exact' | 'heuristic' | 'ml',
  { label: string; cls: string }
> = {
  exact: { label: 'Точный', cls: 'bg-emerald-600/20 text-emerald-300' },
  heuristic: { label: 'Эвристика', cls: 'bg-blue-600/20 text-blue-300' },
  ml: { label: 'ML', cls: 'bg-violet-600/20 text-violet-300' },
};

export default function ResultCard({ result }: Props) {
  const isML = isMlAlgorithm(result.algorithm_name ?? '');
  const cat = categoryOf(result.algorithm_name ?? '');
  const approx = isApproximate(result);
  const cb = CATEGORY_BADGE[cat];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h3 className="text-lg font-semibold">{result.display_name}</h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${cb.cls}`}>
          {cb.label}
        </span>
        {isML && (
          <span className="px-2 py-0.5 bg-violet-600/20 text-violet-400 rounded text-xs font-medium">
            🧠 ML
          </span>
        )}
        {approx && (
          <span
            title="Не гарантирует глобальный оптимум"
            className="px-2 py-0.5 bg-amber-600/20 text-amber-300 rounded text-xs font-medium"
          >
            ⚠️ приближённый
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
