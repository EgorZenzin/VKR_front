import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface TaskSection {
  title: string;
  body: string; // plain text
  formulas?: string[]; // LaTeX strings
}

interface TaskDescription {
  title: string;
  overview: string;
  sections: TaskSection[];
}

const TASK_DESCRIPTIONS: Record<string, TaskDescription> = {
  tsp: {
    title: 'Задача коммивояжёра (TSP)',
    overview:
      'Задача коммивояжёра — одна из классических задач комбинаторной оптимизации. ' +
      'Требуется найти кратчайший замкнутый маршрут, проходящий через каждый из N городов ровно один раз.',
    sections: [
      {
        title: 'Математическая постановка',
        body: 'Пусть задан граф из N городов. Расстояние между городами i и j обозначается d(i, j). ' +
          'Переменная x_ij = 1, если маршрут проходит из города i в город j, иначе 0.',
        formulas: [
          String.raw`\text{Минимизировать: } \sum_{i=1}^{N}\sum_{j=1}^{N} d_{ij}\, x_{ij}`,
          String.raw`\text{При ограничениях:} \quad \sum_{j=1}^{N} x_{ij} = 1, \quad \forall\, i`,
          String.raw`\sum_{i=1}^{N} x_{ij} = 1, \quad \forall\, j`,
          String.raw`x_{ij} \in \{0, 1\}`,
        ],
      },
      {
        title: 'Подзадача исключения подциклов (ограничения Миллера–Такера–Землина)',
        body: 'Чтобы маршрут был единственным связным циклом (без подциклов), добавляются вспомогательные условия:',
        formulas: [
          String.raw`u_i - u_j + N\, x_{ij} \leq N - 1, \quad 2 \leq i \neq j \leq N`,
        ],
      },
      {
        title: 'Эвристические методы решения',
        body: 'Из-за экспоненциальной сложности O(N!) точные методы применяются только для малых N. ' +
          'Для больших N используются метаэвристики: генетический алгоритм, имитация отжига, муравьиный алгоритм. ' +
          'Ближайший сосед (greedy) даёт быстрое приближённое решение за O(N²).',
      },
    ],
  },

  knapsack: {
    title: 'Задача о рюкзаке (0/1 Knapsack)',
    overview:
      'Задача о рюкзаке — классическая задача комбинаторной оптимизации. ' +
      'Имеется набор из N предметов; каждый предмет i имеет вес w_i и ценность v_i. ' +
      'Необходимо выбрать подмножество предметов с максимальной суммарной ценностью, ' +
      'не превысив вместимость рюкзака W.',
    sections: [
      {
        title: 'Математическая постановка',
        body: 'Бинарная переменная x_i = 1 означает, что предмет i включён в рюкзак.',
        formulas: [
          String.raw`\text{Максимизировать: } \sum_{i=1}^{N} v_i\, x_i`,
          String.raw`\text{При ограничении: } \sum_{i=1}^{N} w_i\, x_i \leq W`,
          String.raw`x_i \in \{0, 1\}, \quad i = 1,\ldots,N`,
        ],
      },
      {
        title: 'Динамическое программирование',
        body: 'Точное решение строится за O(N·W) с помощью рекуррентного соотношения:',
        formulas: [
          String.raw`dp[i][w] = \max\!\left(dp[i-1][w],\; v_i + dp[i-1][w - w_i]\right), \quad w \geq w_i`,
          String.raw`dp[0][w] = 0 \quad \forall\, w`,
        ],
      },
      {
        title: 'Метаэвристики',
        body: 'При больших N и W применяются генетические алгоритмы и алгоритм имитации отжига. ' +
          'Жадная эвристика сортирует предметы по убыванию удельной ценности v_i/w_i.',
      },
    ],
  },

  assignment: {
    title: 'Задача о назначениях (Assignment Problem)',
    overview:
      'Задача о назначениях — специальный вид задачи о транспортировке. ' +
      'Требуется назначить N исполнителей на N задач так, чтобы минимизировать суммарные затраты. ' +
      'Матрица затрат C содержит стоимость c_ij назначения исполнителя i на задачу j.',
    sections: [
      {
        title: 'Математическая постановка',
        body: 'Переменная x_ij = 1, если исполнитель i назначен на задачу j.',
        formulas: [
          String.raw`\text{Минимизировать: } \sum_{i=1}^{N}\sum_{j=1}^{N} c_{ij}\, x_{ij}`,
          String.raw`\text{Каждый исполнитель назначен ровно один раз: } \sum_{j=1}^{N} x_{ij} = 1, \quad \forall\, i`,
          String.raw`\text{Каждая задача выполнена ровно одним: } \sum_{i=1}^{N} x_{ij} = 1, \quad \forall\, j`,
          String.raw`x_{ij} \in \{0, 1\}`,
        ],
      },
      {
        title: 'Венгерский алгоритм',
        body: 'Задача о назначениях решается точно за O(N³) венгерским алгоритмом (метод Куна–Манкреса). ' +
          'Алгоритм итеративно вычитает минимумы строк и столбцов матрицы затрат и строит максимальное паросочетание.',
        formulas: [
          String.raw`c'_{ij} = c_{ij} - \min_k c_{ik} - \min_k c_{kj} \geq 0`,
        ],
      },
      {
        title: 'Связь с задачей линейного программирования',
        body: 'Задача о назначениях является LP-задачей с целочисленной матрицей ограничений (унимодулярной), ' +
          'поэтому LP-релаксация (x_ij ≥ 0) автоматически даёт целочисленное оптимальное решение.',
      },
    ],
  },
};

function KatexBlock({ latex }: { latex: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        ref.current.innerHTML = katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        ref.current.textContent = latex;
      }
    }
  }, [latex]);
  return <div ref={ref} className="my-2 overflow-x-auto" />;
}

interface Props {
  taskName: string;
  onClose: () => void;
}

export default function TaskInfoModal({ taskName, onClose }: Props) {
  const desc = TASK_DESCRIPTIONS[taskName];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!desc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">{desc.title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-5 text-sm text-slate-300 leading-relaxed">
          <p className="text-slate-200">{desc.overview}</p>

          {desc.sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-blue-400 font-semibold mb-2">{section.title}</h3>
              <p className="mb-2">{section.body}</p>
              {section.formulas?.map((f, fi) => (
                <KatexBlock key={fi} latex={f} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
