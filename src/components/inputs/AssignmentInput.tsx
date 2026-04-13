import { useState } from 'react';
import { generateCostMatrix } from '../../utils/generators';

interface Props {
  matrix: number[][];
  onChange: (m: number[][]) => void;
}

export default function AssignmentInput({ matrix, onChange }: Props) {
  const [size, setSize] = useState(matrix.length || 3);

  const handleGenerate = () => onChange(generateCostMatrix(size));

  const updateCell = (r: number, c: number, val: string) => {
    const m = matrix.map((row) => [...row]);
    m[r][c] = Number(val) || 0;
    onChange(m);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Матрица стоимостей</h3>
      <div className="flex gap-2 mb-3 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Размер (N×N)</label>
          <input
            type="number"
            min={3}
            max={10}
            value={size}
            onChange={(e) => setSize(Math.max(3, Math.min(10, Number(e.target.value) || 3)))}
            className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          />
        </div>
        <button onClick={handleGenerate} className="px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors">
          Сгенерировать
        </button>
      </div>
      <div className="overflow-auto max-h-80">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="w-10" />
              {matrix[0]?.map((_, c) => (
                <th key={c} className="text-slate-400 px-1 py-1 text-center">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                <td className="text-slate-400 pr-2 text-right">{r}</td>
                {row.map((val, c) => (
                  <td key={c} className="p-0.5">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      className="w-16 bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-sm text-white text-center"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
