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

interface Props {
  numVertices: number;
  edges: number[][];
  onChangeVertices: (n: number) => void;
  onChangeEdges: (e: number[][]) => void;
}

export default function GraphColoringInput({
  numVertices,
  edges,
  onChangeVertices,
  onChangeEdges,
}: Props) {
  const [genEdgeCount, setGenEdgeCount] = useState(10);

  const addEdge = () => onChangeEdges([...edges, [0, 1]]);

  const removeEdge = (i: number) => onChangeEdges(edges.filter((_, idx) => idx !== i));

  const updateEdge = (i: number, pos: 0 | 1, val: string) => {
    const updated = edges.map((e) => [...e]);
    updated[i][pos] = Number(val) || 0;
    onChangeEdges(updated);
  };

  const generateRandom = () => {
    const edgeSet = new Set<string>();
    const gen: number[][] = [];
    const maxEdges = Math.min(genEdgeCount, (numVertices * (numVertices - 1)) / 2);
    while (gen.length < maxEdges) {
      const a = Math.floor(Math.random() * numVertices);
      let b = Math.floor(Math.random() * numVertices);
      if (a === b) continue;
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      gen.push([Math.min(a, b), Math.max(a, b)]);
    }
    onChangeEdges(gen);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Граф
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
          label="Кол-во рёбер"
          type="number"
          size="small"
          value={genEdgeCount}
          onChange={(e) => setGenEdgeCount(Number(e.target.value) || 3)}
          sx={{ width: 120 }}
        />
        <Button variant="outlined" onClick={generateRandom}>
          Сгенерировать рёбра
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
              <TableCell>Вершина 1</TableCell>
              <TableCell>Вершина 2</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {edges.map((e, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={e[0]}
                    onChange={(ev) => updateEdge(i, 0, ev.target.value)}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={e[1]}
                    onChange={(ev) => updateEdge(i, 1, ev.target.value)}
                    sx={{ width: 70 }}
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
