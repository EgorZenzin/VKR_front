import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ConvergenceSeries } from '../../types';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

interface SingleProps {
  data: { iteration: number; value: number }[];
  series?: never;
}

interface MultiProps {
  series: ConvergenceSeries[];
  data?: never;
}

type Props = SingleProps | MultiProps;

export default function ConvergenceChart(props: Props) {
  if (props.series) {
    const merged: Record<number, Record<string, number>> = {};
    props.series.forEach((s) => {
      s.data.forEach((p) => {
        if (!merged[p.iteration]) merged[p.iteration] = { iteration: p.iteration };
        merged[p.iteration][s.algorithm_name] = p.value;
      });
    });
    const chartData = Object.values(merged).sort((a, b) => a.iteration - b.iteration);

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="iteration" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
          <Legend />
          {props.series.map((s, i) => (
            <Line
              key={s.algorithm_name}
              type="monotone"
              dataKey={s.algorithm_name}
              name={s.display_name}
              stroke={s.algorithm_name.includes('_ml') ? '#8B5CF6' : COLORS[i % COLORS.length]}
              strokeDasharray={s.algorithm_name.includes('_ml') ? '8 4' : undefined}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (!props.data || props.data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={props.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="iteration" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
        <Line type="monotone" dataKey="value" stroke="#8B5CF6" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
