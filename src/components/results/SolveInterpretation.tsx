import type { SolveResponse } from '../../types';
import {
  categoryOf,
  isApproximate,
  isMlAlgorithm,
} from '../../utils/algorithms';

interface Props {
  result: SolveResponse;
  optimization: 'minimize' | 'maximize';
}

interface Highlight {
  kind: 'success' | 'info' | 'warning';
  text: string;
}

const fmtTime = (t: number) =>
  t < 1 ? `${(t * 1000).toFixed(1)} мс` : `${t.toFixed(3)} с`;

const fmtPct = (v: number, digits = 1) =>
  `${v >= 0 ? '+' : ''}${(v * 100).toFixed(digits)}%`;

/**
 * Краткие текстовые выводы по результату одиночного запуска.
 * Помогает интерпретировать цифры на защите без устного комментария.
 */
export default function SolveInterpretation({ result, optimization }: Props) {
  const highlights = buildSolveHighlights(result, optimization);
  if (highlights.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-base font-semibold mb-3">📋 Интерпретация</h3>
      <div className="space-y-1.5">
        {highlights.map((h, i) => {
          const cls =
            h.kind === 'success'
              ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-200'
              : h.kind === 'warning'
                ? 'bg-amber-900/30 border-amber-700/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-700 text-slate-300';
          const icon =
            h.kind === 'success' ? '✅' : h.kind === 'warning' ? '⚠️' : 'ℹ️';
          return (
            <div
              key={i}
              className={`text-sm rounded border px-3 py-2 ${cls}`}
            >
              <span className="mr-2">{icon}</span>
              {h.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildSolveHighlights(
  result: SolveResponse,
  optimization: 'minimize' | 'maximize',
): Highlight[] {
  const highlights: Highlight[] = [];
  const cat = categoryOf(result.algorithm_name);
  const ml = isMlAlgorithm(result.algorithm_name);
  const approx = isApproximate(result);

  // Природа решения
  if (cat === 'exact' && !ml) {
    highlights.push({
      kind: 'success',
      text: `Найден гарантированный глобальный ${
        optimization === 'minimize' ? 'минимум' : 'максимум'
      } за ${fmtTime(result.execution_time)}.`,
    });
  } else if (ml && approx) {
    highlights.push({
      kind: 'warning',
      text: `Это ML-усиленный приближённый алгоритм: решение получено за ${fmtTime(
        result.execution_time,
      )}, но глобальный оптимум не гарантирован.`,
    });
  } else if (ml) {
    highlights.push({
      kind: 'info',
      text: `Использована ML-усиленная версия алгоритма. Время: ${fmtTime(
        result.execution_time,
      )}.`,
    });
  } else {
    highlights.push({
      kind: 'info',
      text: `Эвристическое решение получено за ${fmtTime(
        result.execution_time,
      )}. Оптимальность не гарантирована.`,
    });
  }

  // Сходимость для итеративных алгоритмов
  const conv = result.convergence_history;
  if (conv && conv.length >= 2) {
    const first = conv[0];
    const last = conv[conv.length - 1];
    if (Number.isFinite(first) && Number.isFinite(last) && Math.abs(first) > 1e-12) {
      const raw = (last - first) / Math.abs(first);
      const improvement = optimization === 'minimize' ? -raw : raw;
      if (Math.abs(improvement) > 0.001) {
        highlights.push({
          kind: improvement > 0 ? 'success' : 'info',
          text: `За ${conv.length} итераций целевая функция ${
            improvement > 0 ? 'улучшилась' : 'не улучшилась'
          } на ${fmtPct(Math.abs(improvement), 2)} (с ${first.toFixed(4)} до ${last.toFixed(4)}).`,
        });
      }
    }
  }

  // ML-метрики: краткое summary
  const m = result.ml_metrics;
  if (m) {
    const exact = typeof m.exact_evaluations === 'number' ? m.exact_evaluations : 0;
    const surrogate =
      typeof m.surrogate_evaluations === 'number' ? m.surrogate_evaluations : 0;
    const total = exact + surrogate;
    if (total > 0) {
      const ratio = surrogate / total;
      const r2 = typeof m.surrogate_accuracy_r2 === 'number' ? m.surrogate_accuracy_r2 : null;
      highlights.push({
        kind: ratio > 0.3 && (r2 === null || r2 > 0.5) ? 'success' : 'info',
        text: `Surrogate-модель заменила ${fmtPct(ratio, 0).replace('+', '')} оценок (${surrogate} из ${total})${
          r2 !== null ? `, R² = ${r2.toFixed(3)}` : ''
        }.`,
      });
    }
  }

  return highlights;
}
