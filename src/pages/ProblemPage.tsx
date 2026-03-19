import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slider,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
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
import { solve, solvePreview } from '../api';

import TspInput from '../components/inputs/TspInput';
import KnapsackInput from '../components/inputs/KnapsackInput';
import AssignmentInput from '../components/inputs/AssignmentInput';
import GraphColoringInput from '../components/inputs/GraphColoringInput';
import MaxFlowInput from '../components/inputs/MaxFlowInput';

import TspChart from '../components/charts/TspChart';
import KnapsackChart from '../components/charts/KnapsackChart';
import GraphColoringChart from '../components/charts/GraphColoringChart';
import MaxFlowChart from '../components/charts/MaxFlowChart';
import ConvergenceChart from '../components/charts/ConvergenceChart';

export default function ProblemPage() {
  const { type } = useParams<{ type: string }>();
  const problemType = type as ProblemType;
  const problem = PROBLEM_MAP[problemType];

  const [algorithm, setAlgorithm] = useState(problem?.algorithms[0]?.name ?? '');
  const [params, setParams] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Input state per problem
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
    { from: 1, to: 2, capacity: 2 },
  ]);
  const [mfSource, setMfSource] = useState(0);
  const [mfSink, setMfSink] = useState(3);

  // Initialize params when algorithm changes
  useEffect(() => {
    const paramKeys = ALGO_PARAMS[algorithm] ?? [];
    const initial: Record<string, number> = {};
    paramKeys.forEach((k) => {
      initial[k] = PARAM_DEFS[k]?.default ?? 100;
    });
    setParams(initial);
  }, [algorithm]);

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

  // Debounced preview
  const previewTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleParamChange = (key: string, val: number) => {
    const next = { ...params, [key]: val };
    setParams(next);
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      try {
        const res = await solvePreview({
          problem_type: problemType,
          algorithm,
          input_data: buildInputData(),
          params: next,
        });
        setResult(res);
        setError('');
      } catch {
        // silent for preview
      }
    }, 400);
  };

  const handleSolve = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await solve({
        problem_type: problemType,
        algorithm,
        input_data: buildInputData(),
        params,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка решения';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!problem) {
    return <Alert severity="error">Задача "{type}" не найдена</Alert>;
  }

  const paramKeys = ALGO_PARAMS[algorithm] ?? [];
  const resultData = result?.result as Record<string, unknown> | undefined;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {problem.label}
      </Typography>

      {/* Algorithm selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Алгоритм</InputLabel>
          <Select
            value={algorithm}
            label="Алгоритм"
            onChange={(e: SelectChangeEvent) => {
              setAlgorithm(e.target.value);
              setResult(null);
            }}
          >
            {problem.algorithms.map((a) => (
              <MenuItem key={a.name} value={a.name}>
                {a.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

      {/* Parameter sliders */}
      {paramKeys.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Параметры алгоритма
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
                  onChange={(_, val) => handleParamChange(key, val as number)}
                  valueLabelDisplay="auto"
                />
              </Box>
            );
          })}
        </Paper>
      )}

      {/* Solve button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSolve}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Решаю...' : 'Решить'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Result */}
      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Результат
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Целевое значение: ${result.objective_value}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Время: ${(result.execution_time * 1000).toFixed(2)} мс`}
              color="secondary"
              variant="outlined"
            />
            <Chip label={`Алгоритм: ${result.algorithm}`} variant="outlined" />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Charts */}
          {problemType === 'tsp' && (
            <TspChart
              cities={cities}
              route={resultData?.route as number[] | undefined}
            />
          )}
          {problemType === 'knapsack' && (
            <KnapsackChart
              items={knapsackItems}
              selected={resultData?.selected_items as number[] | undefined}
            />
          )}
          {problemType === 'graph_coloring' && (
            <GraphColoringChart
              numVertices={gcVertices}
              edges={gcEdges}
              coloring={resultData?.coloring as Record<string, number> | number[] | undefined}
            />
          )}
          {problemType === 'max_flow' && (
            <MaxFlowChart
              edges={mfEdges}
              flows={resultData?.flows as Record<string, number> | undefined}
            />
          )}

          {/* Convergence */}
          <ConvergenceChart
            convergence={resultData?.convergence as number[] | undefined}
          />

          {/* Raw result */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Детали
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 300,
                fontSize: 12,
              }}
            >
              {JSON.stringify(result.result, null, 2)}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
