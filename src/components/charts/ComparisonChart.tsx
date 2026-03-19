import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import type { SolveResult } from '../../types';

interface Props {
  results: SolveResult[];
}

const COLORS = ['#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0'];

export default function ComparisonChart({ results }: Props) {
  if (!results || results.length === 0) return null;

  const data = results.map((r) => ({
    algorithm: r.algorithm,
    objective: r.objective_value,
    time: +(r.execution_time * 1000).toFixed(2),
  }));

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Сравнение алгоритмов
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="algorithm" />
          <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
          <YAxis yAxisId="right" orientation="right" stroke="#f44336" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="objective"
            name="Целевое значение"
            fill="#1976d2"
          />
          <Bar
            yAxisId="right"
            dataKey="time"
            name="Время (мс)"
            fill="#f44336"
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
