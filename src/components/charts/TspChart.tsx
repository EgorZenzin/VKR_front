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
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="x" type="number" name="X" stroke="#64748b" />
        <YAxis dataKey="y" type="number" name="Y" stroke="#64748b" />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b' }}
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
