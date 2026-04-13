import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import Loader from '../components/Loader';

const TASK_ICONS: Record<string, string> = {
  tsp: '🗺️',
  knapsack: '🎒',
  assignment: '📋',
};

export default function HomePage() {
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Комбинаторная оптимизация</h1>
        <p className="text-slate-400 mt-2">
          Решайте задачи оптимизации классическими алгоритмами и сравнивайте их
          с генетическими алгоритмами, усиленными машинным обучением.
        </p>
      </div>

      {/* Task cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tasks.map((t) => (
          <div
            key={t.name}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-colors"
          >
            <div className="text-4xl mb-3">{TASK_ICONS[t.name] || '🔧'}</div>
            <h2 className="text-lg font-semibold mb-1">{t.display_name}</h2>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              {t.description}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {t.algorithms.length} алгоритмов •{' '}
              {t.optimization === 'minimize' ? 'минимизация' : 'максимизация'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/solve/${t.name}`)}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Решить
              </button>
              <button
                onClick={() => navigate(`/compare/${t.name}`)}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Сравнить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ML comparison quick access */}
      <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700/30 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2">🧠 ML vs Классика</h2>
        <p className="text-sm text-slate-400 mb-4">
          Быстро сравните генетический алгоритм с суррогатной ML-моделью и без
          неё. Алгоритмы{' '}
          <code className="text-violet-400">genetic_ml</code> используют
          нейросетевую суррогатную модель для ускорения поиска.
        </p>
        <div className="flex flex-wrap gap-3">
          {tasks.map((t) => (
            <button
              key={t.name}
              onClick={() => navigate(`/compare/${t.name}?preset=ml`)}
              className="px-4 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              {TASK_ICONS[t.name]} {t.display_name}: ML vs Без ML
            </button>
          ))}
          <button
            onClick={() => navigate('/ml-overview')}
            className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Подробнее о ML-модуле →
          </button>
        </div>
      </div>
    </div>
  );
}
