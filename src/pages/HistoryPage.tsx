import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteCompareHistory,
  deleteSolveHistory,
  getCompareHistory,
  getSolveHistory,
} from '../api/history';
import { extractErrorMessage } from '../api/client';
import type { ComparisonHistoryOut, SolveHistoryOut } from '../types';

type Tab = 'solve' | 'compare';

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('solve');

  return (
    <div className="text-slate-100">
      <h1 className="text-xl font-semibold mb-4">История запусков</h1>

      <div className="flex gap-2 mb-4 border-b border-slate-700">
        <TabButton active={tab === 'solve'} onClick={() => setTab('solve')}>
          Решения
        </TabButton>
        <TabButton active={tab === 'compare'} onClick={() => setTab('compare')}>
          Сравнения
        </TabButton>
      </div>

      {tab === 'solve' ? <SolveHistoryList /> : <CompareHistoryList />}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
        active
          ? 'border-blue-500 text-white'
          : 'border-transparent text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

/* ───── Solve list ───── */

function SolveHistoryList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SolveHistoryOut[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (off: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSolveHistory(PAGE_SIZE, off);
      setItems(data);
      setHasMore(data.length === PAGE_SIZE);
      setOffset(off);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const onDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить запись?')) return;
    try {
      await deleteSolveHistory(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const openDetail = (it: SolveHistoryOut) => {
    navigate(`/history/solve/${it.id}`, { state: { record: it } });
  };

  return (
    <div>
      {error && <ErrorBox text={error} />}
      <div className="overflow-x-auto rounded border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <Th>ID</Th>
              <Th>Задача</Th>
              <Th>Алгоритм</Th>
              <Th>Objective</Th>
              <Th>Время, мс</Th>
              <Th>Создано</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                onClick={() => openDetail(it)}
                className="border-t border-slate-700 hover:bg-slate-800/50 cursor-pointer"
              >
                <Td>{it.id}</Td>
                <Td>{it.task_name}</Td>
                <Td>{it.algorithm}</Td>
                <Td>{it.objective_value ?? '—'}</Td>
                <Td>{it.elapsed_ms ?? '—'}</Td>
                <Td>{new Date(it.created_at).toLocaleString()}</Td>
                <Td>
                  <button
                    onClick={(e) => onDelete(it.id, e)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    удалить
                  </button>
                </Td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <div className="text-center py-6 text-slate-500">Нет записей</div>
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        offset={offset}
        hasMore={hasMore}
        loading={loading}
        onPrev={() => load(Math.max(0, offset - PAGE_SIZE))}
        onNext={() => load(offset + PAGE_SIZE)}
      />
    </div>
  );
}

/* ───── Compare list ───── */

function CompareHistoryList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ComparisonHistoryOut[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (off: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompareHistory(PAGE_SIZE, off);
      setItems(data);
      setHasMore(data.length === PAGE_SIZE);
      setOffset(off);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const onDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить запись?')) return;
    try {
      await deleteCompareHistory(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const openDetail = (it: ComparisonHistoryOut) => {
    navigate(`/history/compare/${it.id}`, { state: { record: it } });
  };

  return (
    <div>
      {error && <ErrorBox text={error} />}
      <div className="overflow-x-auto rounded border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <Th>ID</Th>
              <Th>Задача</Th>
              <Th>Алгоритмы</Th>
              <Th>Кол-во</Th>
              <Th>Создано</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                onClick={() => openDetail(it)}
                className="border-t border-slate-700 hover:bg-slate-800/50 cursor-pointer"
              >
                <Td>{it.id}</Td>
                <Td>{it.task_name}</Td>
                <Td>{it.algorithms.join(', ')}</Td>
                <Td>{it.algorithms_count}</Td>
                <Td>{new Date(it.created_at).toLocaleString()}</Td>
                <Td>
                  <button
                    onClick={(e) => onDelete(it.id, e)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    удалить
                  </button>
                </Td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  <div className="text-center py-6 text-slate-500">Нет записей</div>
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        offset={offset}
        hasMore={hasMore}
        loading={loading}
        onPrev={() => load(Math.max(0, offset - PAGE_SIZE))}
        onNext={() => load(offset + PAGE_SIZE)}
      />
    </div>
  );
}

/* ───── shared ───── */

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-medium">{children}</th>;
}
function Td({
  children,
  colSpan,
}: {
  children?: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td className="px-3 py-2 align-top" colSpan={colSpan}>
      {children}
    </td>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2">
      {text}
    </div>
  );
}

function Pagination({
  offset,
  hasMore,
  loading,
  onPrev,
  onNext,
}: {
  offset: number;
  hasMore: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-3 text-sm text-slate-400">
      <span>
        Показано {offset + 1}–{offset + PAGE_SIZE}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={offset === 0 || loading}
          className="px-3 py-1 rounded bg-slate-800 border border-slate-700 disabled:opacity-50 hover:bg-slate-700"
        >
          ← Назад
        </button>
        <button
          onClick={onNext}
          disabled={!hasMore || loading}
          className="px-3 py-1 rounded bg-slate-800 border border-slate-700 disabled:opacity-50 hover:bg-slate-700"
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
