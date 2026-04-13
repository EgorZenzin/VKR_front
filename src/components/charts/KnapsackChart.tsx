import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { KnapsackItem } from '../../types';

interface Props {
  items: KnapsackItem[];
  capacity: number;
  solution: number[];
}

export default function KnapsackChart({ items, capacity, solution }: Props) {
  const selected = new Set(solution || []);
  const totalWeight = items
    .filter((_, i) => selected.has(i))
    .reduce((s, item) => s + item.weight, 0);
  const fillPct = capacity > 0 ? Math.min((totalWeight / capacity) * 100, 100) : 0;

  const data = items.map((item, i) => ({
    name: `#${i + 1}`,
    value: item.value,
    weight: item.weight,
    selected: selected.has(i),
  }));

  return (
    <div className="space-y-4">
      {/* Capacity progress bar */}
      <div>
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Заполнение рюкзака</span>
          <span>{totalWeight} / {capacity} ({fillPct.toFixed(0)}%)</span>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={50} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(value: number, name: string) => [value, name === 'value' ? 'Ценность' : name]}
          />
          <Bar dataKey="value" name="Ценность">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.selected ? '#10B981' : '#475569'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500">Зелёные — выбранные предметы, серые — невыбранные</p>
    </div>
  );
}
