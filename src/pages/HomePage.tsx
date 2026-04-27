import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import Loader from '../components/Loader';
import { countMl, groupAlgorithms } from '../utils/algorithms';

const TASK_ICONS: Record<string, string> = {
  tsp: '🗺️',
  knapsack: '🎒',
  assignment: '📋',
};

export default function HomePage() {
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();

  if (loading) return <Loader />;

  // Сводная статистика по всем задачам — реальные данные API.
  const totalAlgos = tasks.reduce((s, t) => s + t.algorithms.length, 0);
  const totalMl = tasks.reduce((s, t) => s + countMl(t.algorithms), 0);
  const allAlgos = tasks.flatMap((t) => t.algorithms);
  const groups = groupAlgorithms(allAlgos);
  // Уникальные базовые имена в каждой категории
  const uniq = (xs: string[]) => Array.from(new Set(xs));
  const exactNames = uniq(groups.exact.map((a) => a.name));
  const heuristicNames = uniq(groups.heuristic.map((a) => a.name));
  const mlBaseNames = uniq(groups.ml.map((a) => a.name.replace(/_ml$/, '')));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs text-violet-300 mb-2">
          <span className="px-2 py-0.5 rounded bg-violet-600/20 border border-violet-600/40">
            ВКР · Исследовательский стенд
          </span>
        </div>
        <h1 className="text-3xl font-bold">Комбинаторная оптимизация</h1>
        <p className="text-slate-300 mt-2 max-w-3xl">
          Сравнение классических, точных и эвристических алгоритмов с их{' '}
          <span className="text-violet-300">ML-усиленными</span> вариантами на
          задачах коммивояжёра, рюкзака и назначения. Цель — оценить, в каких
          сценариях суррогатные модели дают выигрыш по времени без потери
          качества решения.
        </p>

        {/* Сводка */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <Stat label="Задач" value={tasks.length} />
          <Stat label="Алгоритмов" value={totalAlgos} />
          <Stat
            label="ML-вариантов"
            value={totalMl}
            accent="text-violet-300"
          />
          <Stat
            label="Классов алгоритмов"
            value={[exactNames.length > 0, heuristicNames.length > 0, mlBaseNames.length > 0].filter(Boolean).length}
          />
        </div>
      </div>

      {/* Что исследуется + Что оценивается */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon="🎯"
          title="Цель системы"
          items={[
            'Сравнить классические алгоритмы с ML-усиленными аналогами на одних и тех же входных данных.',
            'Показать, где суррогатная модель ускоряет поиск без потери качества.',
            'Выявить случаи, когда ML-вариант даёт приближённое решение и не гарантирует глобальный оптимум.',
          ]}
        />
        <InfoCard
          icon="📐"
          title="Что оценивается"
          items={[
            'Время выполнения и относительное ускорение base → base_ml.',
            'Качество решения (значение целевой функции) с учётом minimize / maximize.',
            'Сходимость итеративных алгоритмов на общем графике.',
            'ML-метрики: точные / суррогатные оценки, R², доля суррогата, обучающие сэмплы.',
          ]}
        />
      </div>

      {/* Поддерживаемые классы алгоритмов */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold mb-1">
          Поддерживаемые классы алгоритмов
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Список формируется по данным API, а не по локальным константам.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ClassCard
            color="emerald"
            title="Точные"
            subtitle="гарантируют глобальный оптимум"
            names={exactNames}
          />
          <ClassCard
            color="blue"
            title="Эвристические"
            subtitle="быстрые, без гарантии оптимальности"
            names={heuristicNames}
          />
          <ClassCard
            color="violet"
            title="ML-усиленные"
            subtitle="с суррогатной моделью (суффикс _ml)"
            names={mlBaseNames.map((n) => `${n}_ml`)}
          />
        </div>
      </div>

      {/* Task cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Задачи</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tasks.map((t) => {
            const total = t.algorithms.length;
            const ml = countMl(t.algorithms);
            return (
              <div
                key={t.name}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-colors"
              >
                <div className="text-4xl mb-3">{TASK_ICONS[t.name] || '🔧'}</div>
                <h3 className="text-lg font-semibold mb-1">{t.display_name}</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {t.description}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {total} алгоритм{plural(total)}
                  {ml > 0 && (
                    <>
                      {' • '}
                      <span className="text-violet-400">{ml} ML</span>
                    </>
                  )}
                  {' • '}
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
            );
          })}
        </div>
      </div>

      {/* ML comparison quick access */}
      <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700/30 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2">🧠 ML vs Классика</h2>
        <p className="text-sm text-slate-400 mb-4">
          Быстро сравните классические алгоритмы с их ML-усиленными вариантами.
          Алгоритмы с суффиксом{' '}
          <code className="text-violet-400">_ml</code> используют суррогатные
          модели машинного обучения для ускорения поиска.
        </p>
        <div className="flex flex-wrap gap-3">
          {tasks
            .filter((t) => countMl(t.algorithms) > 0)
            .map((t) => (
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-2xl font-bold ${accent || 'text-slate-100'}`}>
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  items,
}: {
  icon: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-base font-semibold mb-3">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <ul className="space-y-1.5 text-sm text-slate-300">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-slate-500 shrink-0">•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClassCard({
  color,
  title,
  subtitle,
  names,
}: {
  color: 'emerald' | 'blue' | 'violet';
  title: string;
  subtitle: string;
  names: string[];
}) {
  const palette = {
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/5',
      title: 'text-emerald-300',
      chip: 'bg-emerald-600/20 text-emerald-200',
    },
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/5',
      title: 'text-blue-300',
      chip: 'bg-blue-600/20 text-blue-200',
    },
    violet: {
      border: 'border-violet-500/40',
      bg: 'bg-violet-500/5',
      title: 'text-violet-300',
      chip: 'bg-violet-600/20 text-violet-200',
    },
  }[color];
  return (
    <div className={`rounded-lg border p-4 ${palette.border} ${palette.bg}`}>
      <div className={`font-semibold ${palette.title}`}>{title}</div>
      <div className="text-xs text-slate-400 mb-3">{subtitle}</div>
      {names.length === 0 ? (
        <div className="text-xs text-slate-500">— нет алгоритмов</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {names.map((n) => (
            <span
              key={n}
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${palette.chip}`}
            >
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return '';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'а';
  return 'ов';
}
