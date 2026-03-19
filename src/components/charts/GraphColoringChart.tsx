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
import { Box, Typography } from '@mui/material';

interface Props {
  numVertices: number;
  edges: number[][];
  coloring?: Record<string, number> | number[];
}

const PALETTE = [
  '#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0',
  '#00bcd4', '#e91e63', '#8bc34a', '#ff5722', '#607d8b',
];

export default function GraphColoringChart({ numVertices, edges, coloring }: Props) {
  if (!coloring) return null;

  const colorArr: number[] = Array.isArray(coloring)
    ? coloring
    : Array.from({ length: numVertices }, (_, i) => (coloring as Record<string, number>)[String(i)] ?? 0);

  const data = colorArr.map((c, i) => ({ name: `V${i}`, color: c }));

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Раскраска вершин (цвет = номер краски)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="color" name="Цвет">
            {data.map((entry, i) => (
              <Cell key={i} fill={PALETTE[entry.color % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
