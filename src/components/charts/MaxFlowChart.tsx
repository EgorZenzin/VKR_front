import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import type { FlowEdge } from '../../types';

interface FlowResult {
  from: number;
  to: number;
  flow: number;
  capacity: number;
}

interface Props {
  edges: FlowEdge[];
  flows?: FlowResult[] | Record<string, number>;
}

export default function MaxFlowChart({ edges, flows }: Props) {
  if (!flows) return null;

  let data: { name: string; flow: number; capacity: number }[];

  if (Array.isArray(flows)) {
    data = flows.map((f) => ({
      name: `${f.from}→${f.to}`,
      flow: f.flow,
      capacity: f.capacity,
    }));
  } else {
    data = edges.map((e) => ({
      name: `${e.from}→${e.to}`,
      flow: (flows as Record<string, number>)[`${e.from}-${e.to}`] ?? 0,
      capacity: e.capacity,
    }));
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Потоки по рёбрам
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="capacity" fill="#e0e0e0" name="Ёмкость" />
          <Bar dataKey="flow" fill="#1976d2" name="Поток" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
