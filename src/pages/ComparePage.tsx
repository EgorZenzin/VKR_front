import { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Slider,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  PROBLEMS,
  PROBLEM_MAP,
  PARAM_DEFS,
  ALGO_PARAMS,
} from '../constants/problems';
import type {
  ProblemType,
  City,
  KnapsackItem,
  FlowEdge,
  InputData,
  SolveResult,
} from '../types';
import { compare } from '../api';

import TspInput from '../components/inputs/TspInput';
import KnapsackInput from '../components/inputs/KnapsackInput';
import AssignmentInput from '../components/inputs/AssignmentInput';
import GraphColoringInput from '../components/inputs/GraphColoringInput';
import MaxFlowInput from '../components/inputs/MaxFlowInput';
import ComparisonChart from '../components/charts/ComparisonChart';

export default function ComparePage() {
  const [problemType, setProblemType] = useState<ProblemType>('tsp');
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([]);
  const [params, setParams] = useState<Record<string, number>>({});
  const [results, setResults] = useState<SolveResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const problem = PROBLEM_MAP[problemType];

  // Input state
  const [cities, setCities] = useState<City[]>(() =>
    Array.from({ length: 5 }, () => ({
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100),
    })),
  );
  const [knapsackItems, setKnapsackItems] = useState<KnapsackItem[]>([
    { weight: 10, value: 60 },
    { weight: 20, value: 100 },
    { weight: 30, value: 120 },
  ]);
  const [capacity, setCapacity] = useState(50);
  const [costMatrix, setCostMatrix] = useState<number[][]>([
    [9, 2, 7],
    [6, 4, 3],
    [5, 8, 1],
  ]);
  const [gcVertices, setGcVertices] = useState(5);
  const [gcEdges, setGcEdges] = useState<number[][]>([
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 4],
  ]);
  const [mfVertices, setMfVertices] = useState(4);
  const [mfEdges, setMfEdges] = useState<FlowEdge[]>([
    { from: 0, to: 1, capacity: 10 },
    { from: 0, to: 2, capacity: 8 },
    { from: 1, to: 3, capacity: 5 },
    { from: 2, to: 3, capacity: 10 },
  ]);
  const [mfSource, setMfSource] = useState(0);
  const [mfSink, setMfSink] = useState(3);

  useEffect(() => {
    setSelectedAlgos([]);
    setResults([]);
    // Collect all unique param keys for all algorithms in this problem
    const allKeys = new Set<string>();
    problem.algorithms.forEach((a) => {
      (ALGO_PARAMS[a.name] ?? []).forEach((k) => allKeys.add(k));
    });
    const initial: Record<string, number> = {};
    allKeys.forEach((k) => {
      initial[k] = PARAM_DEFS[k]?.default ?? 100;
    });
    setParams(initial);
  }, [problemType]);

  const buildInputData = useCallback((): InputData => {
    switch (problemType) {
      case 'tsp':
        return { cities };
      case 'knapsack':
        return { items: knapsackItems, capacity };
      case 'assignment':
        return { cost_matrix: costMatrix };
      case 'graph_coloring':
        return { num_vertices: gcVertices, edges: gcEdges };
      case 'max_flow':
        return {
          num_vertices: mfVertices,
          edges: mfEdges,
          source: mfSource,
          sink: mfSink,
        };
    }
  }, [problemType, cities, knapsackItems, capacity, costMatrix, gcVertices, gcEdges, mfVertices, mfEdges, mfSource, mfSink]);

  const toggleAlgo = (name: string) => {
    setSelectedAlgos((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    );
  };

  const handleCompare = async () => {
    if (selectedAlgos.length < 2) {
      setError('Выберите минимум 2 алгоритма');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await compare({
        problem_type: problemType,
        algorithms: selectedAlgos,
        input_data: buildInputData(),
        params,
      });
      setResults(res.results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сравнения';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Collect parameter keys for selected algorithms
  const paramKeys = Array.from(
    new Set(selectedAlgos.flatMap((a) => ALGO_PARAMS[a] ?? [])),
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Сравнение алгоритмов
      </Typography>

      {/* Problem selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Задача</InputLabel>
          <Select
            value={problemType}
            label="Задача"
            onChange={(e: SelectChangeEvent) =>
              setProblemType(e.target.value as ProblemType)
            }
          >
            {PROBLEMS.map((p) => (
              <MenuItem key={p.type} value={p.type}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Algorithm selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Алгоритмы
        </Typography>
        <FormGroup row>
          {problem.algorithms.map((a) => (
            <FormControlLabel
              key={a.name}
              control={
                <Checkbox
                  checked={selectedAlgos.includes(a.name)}
                  onChange={() => toggleAlgo(a.name)}
                />
              }
              label={a.label}
            />
          ))}
        </FormGroup>
      </Paper>

      {/* Input data */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {problemType === 'tsp' && (
          <TspInput cities={cities} onChange={setCities} />
        )}
        {problemType === 'knapsack' && (
          <KnapsackInput
            items={knapsackItems}
            capacity={capacity}
            onChangeItems={setKnapsackItems}
            onChangeCapacity={setCapacity}
          />
        )}
        {problemType === 'assignment' && (
          <AssignmentInput matrix={costMatrix} onChange={setCostMatrix} />
        )}
        {problemType === 'graph_coloring' && (
          <GraphColoringInput
            numVertices={gcVertices}
            edges={gcEdges}
            onChangeVertices={setGcVertices}
            onChangeEdges={setGcEdges}
          />
        )}
        {problemType === 'max_flow' && (
          <MaxFlowInput
            numVertices={mfVertices}
            edges={mfEdges}
            source={mfSource}
            sink={mfSink}
            onChangeVertices={setMfVertices}
            onChangeEdges={setMfEdges}
            onChangeSource={setMfSource}
            onChangeSink={setMfSink}
          />
        )}
      </Paper>

      {/* Params */}
      {paramKeys.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Параметры
          </Typography>
          {paramKeys.map((key) => {
            const def = PARAM_DEFS[key];
            if (!def) return null;
            return (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {def.label}: {params[key] ?? def.default}
                </Typography>
                <Slider
                  value={params[key] ?? def.default}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  onChange={(_, val) =>
                    setParams((p) => ({ ...p, [key]: val as number }))
                  }
                  valueLabelDisplay="auto"
                />
              </Box>
            );
          })}
        </Paper>
      )}

      {/* Compare button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCompare}
          disabled={loading || selectedAlgos.length < 2}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Сравниваю...' : 'Сравнить'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Результаты сравнения
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Алгоритм</TableCell>
                <TableCell align="right">Целевое значение</TableCell>
                <TableCell align="right">Время (мс)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.algorithm}</TableCell>
                  <TableCell align="right">{r.objective_value}</TableCell>
                  <TableCell align="right">
                    {(r.execution_time * 1000).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />
          <ComparisonChart results={results} />
        </Paper>
      )}
    </Box>
  );
}
