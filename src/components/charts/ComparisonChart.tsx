import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import type { LabelValues, SolveResponse } from '../../types';

const BLUE = '#3B82F6';
const ML_PURPLE = '#8B5CF6';

interface BarChartProps {
  title: string;
  comparison: LabelValues;
  unit?: string;
  results?: SolveResponse[];
}

export function ComparisonBarChart({ title, comparison, unit, results }: BarChartProps) {
  const data = comparison.labels.map((label, i) => ({
    name: label,
    value: comparison.values[i],
    isML: results ? results[i]?.algorithm_name?.includes('_ml') : false,
  }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-300 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
          <Bar dataKey="value" name={unit || 'Значение'}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isML ? ML_PURPLE : BLUE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieProps {
  exact: number;
  surrogate: number;
}

export function SurrogateRatioPie({ exact, surrogate }: PieProps) {
  const data = [
    { name: 'Точные', value: exact, fill: BLUE },
    { name: 'Суррогатные', value: surrogate, fill: ML_PURPLE },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
