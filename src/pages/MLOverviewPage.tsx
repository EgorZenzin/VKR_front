import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { generateCities, generateKnapsackItems, generateCostMatrix } from '../utils/generators';
import { compareTasks } from '../api';
import type { CompareResponse } from '../types';
import Loader from '../components/Loader';
import { findMlPairs, isMlAlgorithm } from '../utils/algorithms';

const TASK_DEFAULTS: Record<string, () => Record<string, unknown>> = {
  tsp: () => ({ cities: generateCities(10) }),
  knapsack: () => {
    const g = generateKnapsackItems(8);
    return { items: g.items, capacity: g.capacity };
  },
  assignment: () => ({ cost_matrix: generateCostMatrix(4) }),
};

export default function MLOverviewPage() {
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [running, setRunning] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<Record<string, CompareResponse>>(() => {
    try {
      const stored = localStorage.getItem('ml_compare_results');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  /**
   * Запускает сравнение всех доступных пар (base, base_ml) для задачи.
   * Не хардкодит конкретные имена алгоритмов — берёт их из метаданных задачи.
   */
  const runComparison = async (taskName: string) => {
    const task = tasks.find((t) => t.name === taskName);
    if (!task) return;
    const pairs = findMlPairs(task.algorithms);
    if (pairs.length === 0) return;
    const algoNames = new Set<string>();
    pairs.forEach((p) => {
      algoNames.add(p.base.name);
      algoNames.add(p.ml.name);
    });
    const algorithms = Array.from(algoNames);

    setRunning(taskName);
    try {
      const inputData = TASK_DEFAULTS[taskName]?.() || {};
      const res = await compareTasks({
        task_name: taskName,
        algorithms,
        input_data: inputData,
      });
      const updated = { ...lastResults, [taskName]: res };
      setLastResults(updated);
      localStorage.setItem('ml_compare_results', JSON.stringify(updated));
    } catch {
      // ignore
    } finally {
      setRunning(null);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Прогрев (Warmup)',
      desc: 'Первые N итераций используют только точную функцию приспособленности для сбора обучающих данных.',
      color: 'bg-blue-600',
    },
    {
      num: 2,
      title: 'Обучение суррогатной модели',
      desc: 'На собранных данных обучается ML-модель, предсказывающая значение ЦФ по решению.',
      color: 'bg-violet-600',
    },
    {
      num: 3,
      title: 'Гибридная оценка',
      desc: 'Часть кандидатов оценивается суррогатной моделью (быстро), а часть — точной функцией (для контроля качества).',
      color: 'bg-emerald-600',
    },
    {
      num: 4,
      title: 'Дообучение',
      desc: 'Периодически суррогатная модель дообучается на новых точных оценках для повышения точности.',
      color: 'bg-amber-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">🧠 ML-модуль: суррогатная оптимизация</h1>
        <p className="text-slate-400 mt-2">
          ML-усиленные варианты алгоритмов (с суффиксом{' '}
          <code className="text-violet-400">_ml</code>) используют суррогатные
          модели машинного обучения для ускорения поиска решения при сохранении
          приемлемого качества.
        </p>
      </div>

      {/* Scheme */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Схема работы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <div className={`${step.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2`}>
                {step.num}
              </div>
              <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <div className="flex-1 h-px bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600" />
          <span>Цикл повторяется до достижения критерия останова</span>
          <div className="flex-1 h-px bg-gradient-to-r from-emerald-600 via-amber-600 to-blue-600" />
        </div>
      </div>

      {/* Quick launch */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрый запуск: ML vs Без ML</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((t) => {
            const pairs = findMlPairs(t.algorithms);
            const hasMl = pairs.length > 0;
            return (
              <div key={t.name} className="bg-slate-900 rounded-lg p-4">
                <h3 className="font-semibold mb-1">{t.display_name}</h3>
                <p className="text-xs text-slate-400 mb-2">{t.description}</p>
                {hasMl ? (
                  <p className="text-[11px] text-violet-300 mb-3">
                    {pairs.length} ML-пар:{' '}
                    {pairs
                      .map((p) => p.base.display_name)
                      .join(', ')}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mb-3">
                    Нет ML-вариантов
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => runComparison(t.name)}
                    disabled={running !== null || !hasMl}
                    className="flex-1 px-3 py-2 text-sm rounded bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white transition-colors"
                  >
                    {running === t.name ? '⏳ Запуск...' : '🧠 Сравнить'}
                  </button>
                  <button
                    onClick={() => navigate(`/compare/${t.name}`)}
                    className="px-3 py-2 text-sm rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  >
                    →
                  </button>
                </div>
                {lastResults[t.name] && (
                  <div className="mt-3 text-xs space-y-1">
                    {lastResults[t.name].results.map((r) => (
                      <div key={r.algorithm_name} className="flex justify-between text-slate-400">
                        <span className={isMlAlgorithm(r.algorithm_name) ? 'text-violet-400' : ''}>
                          {r.display_name}
                        </span>
                        <span className="font-mono">
                          ЦФ: {r.objective_value.toFixed(2)} | {(r.execution_time * 1000).toFixed(0)}мс
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {running && <Loader />}
    </div>
  );
}
