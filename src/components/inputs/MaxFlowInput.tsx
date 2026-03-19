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
import type { FlowEdge } from '../../types';

interface Props {
  numVertices: number;
  edges: FlowEdge[];
  source: number;
  sink: number;
  onChangeVertices: (n: number) => void;
  onChangeEdges: (e: FlowEdge[]) => void;
  onChangeSource: (s: number) => void;
  onChangeSink: (s: number) => void;
}

export default function MaxFlowInput({
  numVertices,
  edges,
  source,
  sink,
  onChangeVertices,
  onChangeEdges,
  onChangeSource,
  onChangeSink,
}: Props) {
  const [genCount, setGenCount] = useState(8);

  const addEdge = () =>
    onChangeEdges([...edges, { from: 0, to: 1, capacity: 10 }]);

  const removeEdge = (i: number) =>
    onChangeEdges(edges.filter((_, idx) => idx !== i));

  const updateEdge = (i: number, field: keyof FlowEdge, val: string) => {
    const updated = [...edges];
    updated[i] = { ...updated[i], [field]: Number(val) || 0 };
    onChangeEdges(updated);
  };

  const generateRandom = () => {
    const gen: FlowEdge[] = [];
    const edgeSet = new Set<string>();
    let attempts = 0;
    while (gen.length < genCount && attempts < genCount * 10) {
      attempts++;
      const a = Math.floor(Math.random() * numVertices);
      const b = Math.floor(Math.random() * numVertices);
      if (a === b) continue;
      const key = `${a}-${b}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      gen.push({ from: a, to: b, capacity: Math.round(Math.random() * 20 + 1) });
    }
    onChangeEdges(gen);
    onChangeSource(0);
    onChangeSink(numVertices - 1);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Сеть потоков
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Вершин"
          type="number"
          size="small"
          value={numVertices}
          onChange={(e) => onChangeVertices(Math.max(2, Number(e.target.value) || 2))}
          sx={{ width: 100 }}
        />
        <TextField
          label="Исток"
          type="number"
          size="small"
          value={source}
          onChange={(e) => onChangeSource(Number(e.target.value) || 0)}
          sx={{ width: 80 }}
        />
        <TextField
          label="Сток"
          type="number"
          size="small"
          value={sink}
          onChange={(e) => onChangeSink(Number(e.target.value) || 0)}
          sx={{ width: 80 }}
        />
        <TextField
          label="Кол-во рёбер"
          type="number"
          size="small"
          value={genCount}
          onChange={(e) => setGenCount(Number(e.target.value) || 3)}
          sx={{ width: 120 }}
        />
        <Button variant="outlined" onClick={generateRandom}>
          Сгенерировать
        </Button>
        <Button variant="outlined" onClick={addEdge}>
          Добавить ребро
        </Button>
      </Box>
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Из</TableCell>
              <TableCell>В</TableCell>
              <TableCell>Ёмкость</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {edges.map((edge, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={edge.from}
                    onChange={(e) => updateEdge(i, 'from', e.target.value)}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={edge.to}
                    onChange={(e) => updateEdge(i, 'to', e.target.value)}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={edge.capacity}
                    onChange={(e) => updateEdge(i, 'capacity', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => removeEdge(i)}>
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
