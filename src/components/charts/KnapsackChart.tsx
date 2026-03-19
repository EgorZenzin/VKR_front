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
import type { KnapsackItem } from '../../types';

interface Props {
  items: KnapsackItem[];
  selected?: number[];
}

const COLORS = ['#ccc', '#4caf50'];

export default function KnapsackChart({ items, selected }: Props) {
  const data = items.map((item, i) => ({
    name: `#${i + 1}`,
    value: item.value,
    weight: item.weight,
    selected: selected ? selected.includes(i) : false,
  }));

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Предметы (зелёные — выбранные)
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" name="Ценность">
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.selected ? 1 : 0]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
