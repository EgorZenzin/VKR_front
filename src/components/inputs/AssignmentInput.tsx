import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';

interface Props {
  matrix: number[][];
  onChange: (m: number[][]) => void;
}

export default function AssignmentInput({ matrix, onChange }: Props) {
  const [size, setSize] = useState(matrix.length || 3);

  const generate = () => {
    const m = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.round(Math.random() * 50 + 1)),
    );
    onChange(m);
  };

  const updateCell = (r: number, c: number, val: string) => {
    const m = matrix.map((row) => [...row]);
    m[r][c] = Number(val) || 0;
    onChange(m);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Матрица стоимостей
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Размер"
          type="number"
          size="small"
          value={size}
          onChange={(e) => setSize(Math.max(2, Number(e.target.value) || 2))}
          sx={{ width: 100 }}
        />
        <Button variant="outlined" onClick={generate}>
          Сгенерировать
        </Button>
      </Box>
      <Box sx={{ overflow: 'auto', maxHeight: 350 }}>
        <table>
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                {row.map((val, c) => (
                  <td key={c} style={{ padding: 2 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={val}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      sx={{ width: 64 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}
