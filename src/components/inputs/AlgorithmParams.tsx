import { useState } from 'react';

const PARAM_DEFS: Record<string, { label: string; default: number; min: number; max: number; step: number }> = {
  generations: { label: 'Поколения', default: 200, min: 50, max: 1000, step: 10 },
  population_size: { label: 'Размер популяции', default: 100, min: 20, max: 500, step: 10 },
  mutation_rate: { label: 'Вероятность мутации', default: 0.05, min: 0.01, max: 0.5, step: 0.01 },
  warmup_generations: { label: 'Поколения прогрева', default: 15, min: 5, max: 50, step: 1 },
  surrogate_ratio: { label: 'Доля суррогата', default: 0.5, min: 0.1, max: 0.9, step: 0.05 },
  retrain_every: { label: 'Дообучение каждые N', default: 10, min: 5, max: 50, step: 5 },
  initial_temp: { label: 'Начальная температура', default: 1000, min: 100, max: 50000, step: 100 },
  cooling_rate: { label: 'Скорость охлаждения', default: 0.995, min: 0.9, max: 0.9999, step: 0.0001 },
};

function getAlgoParamKeys(algo: string): string[] {
  if (algo.includes('_ml'))
    return ['generations', 'population_size', 'mutation_rate', 'warmup_generations', 'surrogate_ratio', 'retrain_every'];
  if (algo === 'genetic')
    return ['generations', 'population_size', 'mutation_rate'];
  if (algo === 'simulated_annealing')
    return ['initial_temp', 'cooling_rate'];
  return [];
}

interface Props {
  algorithm: string;
  params: Record<string, number>;
  onChange: (params: Record<string, number>) => void;
}

export default function AlgorithmParams({ algorithm, params, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const keys = getAlgoParamKeys(algorithm);

  if (keys.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-750 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-300">
          Параметры алгоритма
        </span>
        <span className="text-xs text-slate-500">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {keys.map((key) => {
            const def = PARAM_DEFS[key];
            if (!def) return null;
            const value = params[key] ?? def.default;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>{def.label}</span>
                  <span className="text-white font-mono">{value}</span>
                </div>
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={value}
                  onChange={(e) =>
                    onChange({ ...params, [key]: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { PARAM_DEFS, getAlgoParamKeys };
