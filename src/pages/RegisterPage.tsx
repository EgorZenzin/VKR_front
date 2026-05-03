import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { extractErrorMessage } from '../api/client';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): string | null => {
    if (username.length < 3 || username.length > 64) {
      return 'Имя пользователя должно быть от 3 до 64 символов';
    }
    if (password.length < 6) {
      return 'Пароль должен быть не короче 6 символов';
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return 'Некорректный email';
    }
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register(email, username, password);
      // автологин
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Не удалось зарегистрироваться'));
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
        <h1 className="text-xl font-semibold">Регистрация</h1>

        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Имя пользователя</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={64}
            autoComplete="username"
            className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-[11px] text-slate-500">3–64 символа</span>
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-[11px] text-slate-500">не менее 6 символов</span>
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
          {submitting ? 'Создание…' : 'Создать аккаунт'}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
