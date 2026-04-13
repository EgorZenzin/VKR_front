import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { City } from '../../types';

interface Props {
  data: Record<string, unknown>;
}

export default function TspChart({ data }: Props) {
  const cities = (data.cities || data.route_coordinates || []) as City[];
  const routeCoords = (data.route_coordinates || []) as City[];

  const displayData =
    routeCoords.length > 0
      ? [...routeCoords, routeCoords[0]]
      : cities;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="x" type="number" name="X" stroke="#94a3b8" />
        <YAxis dataKey="y" type="number" name="Y" stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Scatter
          data={displayData}
          fill="#3B82F6"
          line={routeCoords.length > 0 ? { stroke: '#3B82F6', strokeWidth: 2 } : false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
