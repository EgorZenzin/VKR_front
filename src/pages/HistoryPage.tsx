import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getHistory, getComparisons } from '../api';
import type { HistoryItem, ComparisonHistoryItem } from '../types';

export default function HistoryPage() {
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<unknown>(null);
  const [detailTitle, setDetailTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [h, c] = await Promise.all([getHistory(), getComparisons()]);
        setHistory(Array.isArray(h) ? h : []);
        setComparisons(Array.isArray(c) ? c : []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openDetail = (title: string, data: unknown) => {
    setDetailTitle(title);
    setDetailData(data);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        История
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Решения (${history.length})`} />
        <Tab label={`Сравнения (${comparisons.length})`} />
      </Tabs>

      {tab === 0 && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Задача</TableCell>
                <TableCell>Алгоритм</TableCell>
                <TableCell align="right">Значение</TableCell>
                <TableCell align="right">Время (мс)</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h) => (
                <TableRow
                  key={h.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openDetail(`Решение #${h.id}`, h)}
                >
                  <TableCell>{h.id}</TableCell>
                  <TableCell>{h.problem_type}</TableCell>
                  <TableCell>{h.algorithm}</TableCell>
                  <TableCell align="right">{h.objective_value}</TableCell>
                  <TableCell align="right">
                    {(h.execution_time * 1000).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(h.created_at).toLocaleString('ru-RU')}
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Нет данных
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Задача</TableCell>
                <TableCell>Алгоритмы</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisons.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openDetail(`Сравнение #${c.id}`, c)}
                >
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.problem_type}</TableCell>
                  <TableCell>{c.algorithms.join(', ')}</TableCell>
                  <TableCell>
                    {new Date(c.created_at).toLocaleString('ru-RU')}
                  </TableCell>
                </TableRow>
              ))}
              {comparisons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Нет данных
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {detailTitle}
          <IconButton onClick={() => setDetailOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 500,
              fontSize: 13,
            }}
          >
            {JSON.stringify(detailData, null, 2)}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
