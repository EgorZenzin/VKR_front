import type { MLMetrics } from '../../types';
import { SurrogateRatioPie } from '../charts/ComparisonChart';

interface Props {
  metrics: MLMetrics;
}

const KNOWN_LABELS: Record<string, string> = {
  ml_used: 'ML использовался',
  surrogate_model: 'Суррогатная модель',
  exact_evaluations: 'Точные оценки',
  surrogate_evaluations: 'Суррогатные оценки',
  surrogate_accuracy_r2: 'R² точность',
  warmup_generations: 'Поколения прогрева',
  surrogate_ratio: 'Доля суррогата',
  training_samples: 'Обучающих сэмплов',
  optimality_guaranteed: 'Гарантированный оптимум',
};

const HIDDEN_KEYS = new Set(['surrogate_model']);

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'да' : 'нет';
  if (typeof value === 'number') {
    if (key === 'surrogate_ratio') return `${(value * 100).toFixed(1)}%`;
    if (key === 'surrogate_accuracy_r2') return value.toFixed(3);
    if (!Number.isInteger(value)) return value.toFixed(4);
    return String(value);
  }
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function humanLabel(key: string): string {
  return (
    KNOWN_LABELS[key] ??
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function MLMetricsCard({ metrics }: Props) {
  const exact =
    typeof metrics.exact_evaluations === 'number' ? metrics.exact_evaluations : 0;
  const surrogate =
    typeof metrics.surrogate_evaluations === 'number'
      ? metrics.surrogate_evaluations
      : 0;
  const showPie = exact + surrogate > 0;

  const entries = Object.entries(metrics).filter(
    ([k, v]) =>
      !HIDDEN_KEYS.has(k) &&
      v !== null &&
      v !== undefined &&
      typeof v !== 'object',
  );

  const optimalityWarning = metrics.optimality_guaranteed === false;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-violet-600/30">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🧠 ML-метрики
        {typeof metrics.surrogate_model === 'string' && (
          <span className="text-xs px-2 py-0.5 bg-violet-600/20 text-violet-400 rounded">
            {metrics.surrogate_model}
          </span>
        )}
      </h3>

      {optimalityWarning && (
        <div className="mb-3 px-3 py-2 rounded bg-amber-900/40 border border-amber-600/40 text-amber-200 text-sm">
          ⚠️ Этот ML-вариант является приближённым и не гарантирует глобальный
          оптимум.
        </div>
      )}

      {entries.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {entries.map(([key, value]) => (
            <Metric
              key={key}
              label={humanLabel(key)}
              value={formatValue(key, value)}
              color={
                key === 'surrogate_accuracy_r2'
                  ? 'text-emerald-400'
                  : key === 'surrogate_ratio'
                    ? 'text-violet-400'
                    : undefined
              }
            />
          ))}
        </div>
      )}

      {showPie && (
        <div className="max-w-sm mx-auto">
          <h4 className="text-sm text-slate-400 text-center mb-2">
            Точные vs Суррогатные оценки
          </h4>
          <SurrogateRatioPie exact={exact} surrogate={surrogate} />
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-slate-900 rounded p-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-semibold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}

