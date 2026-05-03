import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { extractErrorMessage } from '../api/client';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Не удалось войти'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-slate-800 rounded-lg shadow-lg p-6 space-y-4 border border-slate-700"
      >
        <h1 className="text-xl font-semibold">Вход</h1>

        <label className="block">
          <span className="text-sm text-slate-300">Имя пользователя или email</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </label>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed py-2 text-sm font-medium transition-colors"
        >
          {submitting ? 'Вход…' : 'Войти'}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
