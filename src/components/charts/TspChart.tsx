import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import type { City } from '../../types';

interface Props {
  cities: City[];
  route?: number[];
}

export default function TspChart({ cities, route }: Props) {
  const routeData =
    route && route.length > 0
      ? [...route, route[0]].map((idx) => cities[idx]).filter(Boolean)
      : [];

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Маршрут
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        {routeData.length > 0 ? (
          <LineChart data={routeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" name="X" />
            <YAxis dataKey="y" type="number" name="Y" />
            <Tooltip />
            <Line
              type="linear"
              dataKey="y"
              stroke="#1976d2"
              dot={{ r: 5, fill: '#f44336' }}
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" name="X" />
            <YAxis dataKey="y" type="number" name="Y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={cities} fill="#1976d2" />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}
