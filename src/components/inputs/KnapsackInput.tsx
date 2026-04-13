import { useState } from 'react';
import type { KnapsackItem } from '../../types';
import { generateKnapsackItems } from '../../utils/generators';

interface Props {
  items: KnapsackItem[];
  capacity: number;
  onChangeItems: (items: KnapsackItem[]) => void;
  onChangeCapacity: (c: number) => void;
}

export default function KnapsackInput({
  items,
  capacity,
  onChangeItems,
  onChangeCapacity,
}: Props) {
  const [count, setCount] = useState(10);

  const addItem = () => onChangeItems([...items, { weight: 1, value: 1 }]);
  const removeItem = (i: number) => onChangeItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: 'weight' | 'value', val: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: Number(val) || 0 };
    onChangeItems(updated);
  };

  const handleGenerate = () => {
    const gen = generateKnapsackItems(count);
    onChangeItems(gen.items);
    onChangeCapacity(gen.capacity);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Предметы</h3>
      <div className="flex gap-2 mb-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Ёмкость</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => onChangeCapacity(Number(e.target.value) || 0)}
            className="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Кол-во</label>
          <input
            type="number"
            min={3}
            max={30}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 3)}
            className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          />
        </div>
        <button onClick={handleGenerate} className="px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors">
          Сгенерировать
        </button>
        <button onClick={addItem} className="px-3 py-1 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors">
          + Предмет
        </button>
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-1 w-10">#</th>
              <th className="text-left py-1">Вес</th>
              <th className="text-left py-1">Ценность</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-slate-700/50">
                <td className="py-1 text-slate-500">{i + 1}</td>
                <td className="py-1">
                  <input type="number" value={item.weight} onChange={(e) => updateItem(i, 'weight', e.target.value)}
                    className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-sm text-white" />
                </td>
                <td className="py-1">
                  <input type="number" value={item.value} onChange={(e) => updateItem(i, 'value', e.target.value)}
                    className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-sm text-white" />
                </td>
                <td className="py-1">
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
