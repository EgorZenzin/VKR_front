import type { MLMetrics } from '../../types';
import { SurrogateRatioPie } from '../charts/ComparisonChart';

interface Props {
  metrics: MLMetrics;
}

export default function MLMetricsCard({ metrics }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-violet-600/30">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🧠 ML-метрики
        <span className="text-xs px-2 py-0.5 bg-violet-600/20 text-violet-400 rounded">
          {metrics.surrogate_model}
        </span>
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Metric label="Точные оценки" value={metrics.exact_evaluations} />
        <Metric label="Суррогатные оценки" value={metrics.surrogate_evaluations} />
        <Metric label="R² точность" value={metrics.surrogate_accuracy_r2.toFixed(3)} color="text-emerald-400" />
        <Metric label="Доля суррогата" value={`${(metrics.surrogate_ratio * 100).toFixed(0)}%`} color="text-violet-400" />
        <Metric label="Поколения прогрева" value={metrics.warmup_generations} />
        <Metric label="Обучающих сэмплов" value={metrics.training_samples} />
      </div>
      <div className="max-w-sm mx-auto">
        <h4 className="text-sm text-slate-400 text-center mb-2">Точные vs Суррогатные оценки</h4>
        <SurrogateRatioPie
          exact={metrics.exact_evaluations}
          surrogate={metrics.surrogate_evaluations}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-slate-900 rounded p-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-semibold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}
