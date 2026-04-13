import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import Loader from './Loader';

export default function Layout() {
  const { tasks, loading } = useTasks();
  const [solveOpen, setSolveOpen] = useState(true);
  const [compareOpen, setCompareOpen] = useState(true);
  const navigate = useNavigate();

  const link = (active: boolean) =>
    `block px-3 py-1.5 rounded text-sm transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div
          className="px-4 py-5 border-b border-slate-800 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <h1 className="text-lg font-bold text-white leading-tight">
            Комбинаторная
            <br />
            оптимизация
          </h1>
          <p className="text-xs text-slate-500 mt-1">ML-модуль</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-sm">
          <NavLink to="/" end className={({ isActive }) => link(isActive)}>
            🏠 Главная
          </NavLink>

          {/* Решить */}
          <button
            onClick={() => setSolveOpen((v) => !v)}
            className="w-full text-left px-3 py-1.5 rounded text-slate-300 hover:bg-slate-800 flex justify-between items-center"
          >
            <span>🧮 Решить</span>
            <span className="text-[10px]">{solveOpen ? '▾' : '▸'}</span>
          </button>
          {solveOpen && (
            <div className="ml-3 space-y-0.5">
              {tasks.map((t) => (
                <NavLink
                  key={t.name}
                  to={`/solve/${t.name}`}
                  className={({ isActive }) => link(isActive)}
                >
                  {t.display_name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Сравнить */}
          <button
            onClick={() => setCompareOpen((v) => !v)}
            className="w-full text-left px-3 py-1.5 rounded text-slate-300 hover:bg-slate-800 flex justify-between items-center"
          >
            <span>📊 Сравнить</span>
            <span className="text-[10px]">{compareOpen ? '▾' : '▸'}</span>
          </button>
          {compareOpen && (
            <div className="ml-3 space-y-0.5">
              {tasks.map((t) => (
                <NavLink
                  key={t.name}
                  to={`/compare/${t.name}`}
                  className={({ isActive }) => link(isActive)}
                >
                  {t.display_name}
                </NavLink>
              ))}
            </div>
          )}

          <NavLink
            to="/ml-overview"
            className={({ isActive }) => link(isActive)}
          >
            🧠 ML обзор
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {loading ? <Loader /> : <Outlet />}
      </main>
    </div>
  );
}
