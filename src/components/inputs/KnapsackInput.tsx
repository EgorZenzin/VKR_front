import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { KnapsackItem } from '../../types';

interface Props {
  items: KnapsackItem[];
  capacity: number;
  onChangeItems: (items: KnapsackItem[]) => void;
  onChangeCapacity: (c: number) => void;
}

export default function KnapsackInput({
  items,
  capacity,
  onChangeItems,
  onChangeCapacity,
}: Props) {
  const [count, setCount] = useState(10);

  const addItem = () => onChangeItems([...items, { weight: 1, value: 1 }]);

  const removeItem = (i: number) => onChangeItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: 'weight' | 'value', val: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: Number(val) || 0 };
    onChangeItems(updated);
  };

  const generateRandom = () => {
    const gen: KnapsackItem[] = Array.from({ length: count }, () => ({
      weight: Math.round(Math.random() * 20 + 1),
      value: Math.round(Math.random() * 100 + 1),
    }));
    onChangeItems(gen);
    onChangeCapacity(Math.round(gen.reduce((s, i) => s + i.weight, 0) / 2));
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Предметы
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Ёмкость"
          type="number"
          size="small"
          value={capacity}
          onChange={(e) => onChangeCapacity(Number(e.target.value) || 0)}
          sx={{ width: 120 }}
        />
        <TextField
          label="Кол-во"
          type="number"
          size="small"
          value={count}
          onChange={(e) => setCount(Number(e.target.value) || 3)}
          sx={{ width: 100 }}
        />
        <Button variant="outlined" onClick={generateRandom}>
          Сгенерировать
        </Button>
        <Button variant="outlined" onClick={addItem}>
          Добавить предмет
        </Button>
      </Box>
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Вес</TableCell>
              <TableCell>Ценность</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.weight}
                    onChange={(e) => updateItem(i, 'weight', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.value}
                    onChange={(e) => updateItem(i, 'value', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => removeItem(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
