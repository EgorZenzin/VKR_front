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
import type { City } from '../../types';

interface Props {
  cities: City[];
  onChange: (cities: City[]) => void;
}

export default function TspInput({ cities, onChange }: Props) {
  const [count, setCount] = useState(10);

  const addCity = () => onChange([...cities, { x: 0, y: 0 }]);

  const removeCity = (i: number) => onChange(cities.filter((_, idx) => idx !== i));

  const updateCity = (i: number, field: 'x' | 'y', val: string) => {
    const updated = [...cities];
    updated[i] = { ...updated[i], [field]: Number(val) || 0 };
    onChange(updated);
  };

  const generateRandom = () => {
    const generated: City[] = Array.from({ length: count }, () => ({
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100),
    }));
    onChange(generated);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Города
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
        <Button variant="outlined" onClick={addCity}>
          Добавить город
        </Button>
      </Box>
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>X</TableCell>
              <TableCell>Y</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={c.x}
                    onChange={(e) => updateCity(i, 'x', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={c.y}
                    onChange={(e) => updateCity(i, 'y', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => removeCity(i)}>
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
