import { useState } from 'react';
import type { City } from '../../types';
import { generateCities } from '../../utils/generators';

interface Props {
  cities: City[];
  onChange: (cities: City[]) => void;
}

export default function TspInput({ cities, onChange }: Props) {
  const [count, setCount] = useState(10);

  const addCity = () => onChange([...cities, { x: 0, y: 0 }]);
  const removeCity = (i: number) => onChange(cities.filter((_, idx) => idx !== i));

  const updateCity = (i: number, field: 'x' | 'y', val: string) => {
    const updated = [...cities];
    updated[i] = { ...updated[i], [field]: Number(val) || 0 };
    onChange(updated);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Города</h3>
      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          type="number"
          min={3}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.max(3, Math.min(50, Number(e.target.value) || 3)))}
          className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
        />
        <button
          onClick={() => onChange(generateCities(count))}
          className="px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors"
        >
          Сгенерировать
        </button>
        <button
          onClick={addCity}
          className="px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors"
        >
          + Город
        </button>
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-1 w-10">#</th>
              <th className="text-left py-1">X</th>
              <th className="text-left py-1">Y</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {cities.map((c, i) => (
              <tr key={i} className="border-b border-slate-700/50">
                <td className="py-1 text-slate-500">{i + 1}</td>
                <td className="py-1">
                  <input
                    type="number"
                    value={c.x}
                    onChange={(e) => updateCity(i, 'x', e.target.value)}
                    className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-sm text-white"
                  />
                </td>
                <td className="py-1">
                  <input
                    type="number"
                    value={c.y}
                    onChange={(e) => updateCity(i, 'y', e.target.value)}
                    className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-sm text-white"
                  />
                </td>
                <td className="py-1">
                  <button
                    onClick={() => removeCity(i)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
