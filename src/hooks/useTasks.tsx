import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TaskInfo } from '../types';
import { getTasks } from '../api';

interface TasksContextValue {
  tasks: TaskInfo[];
  loading: boolean;
  error: string | null;
  getTask: (name: string) => TaskInfo | undefined;
}

const TasksContext = createContext<TasksContextValue>({
  tasks: [],
  loading: true,
  error: null,
  getTask: () => undefined,
});

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err?.response?.data?.detail || err.message))
      .finally(() => setLoading(false));
  }, []);

  const getTask = (name: string) => tasks.find((t) => t.name === name);

  return (
    <TasksContext.Provider value={{ tasks, loading, error, getTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => useContext(TasksContext);
