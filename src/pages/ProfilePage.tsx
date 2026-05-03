import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-100">
      <h1 className="text-xl font-semibold mb-4">Профиль</h1>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between border-b border-slate-700 pb-1">
          <dt className="text-slate-400">ID</dt>
          <dd>{user.id}</dd>
        </div>
        <div className="flex justify-between border-b border-slate-700 pb-1">
          <dt className="text-slate-400">Username</dt>
          <dd>{user.username}</dd>
        </div>
        <div className="flex justify-between border-b border-slate-700 pb-1">
          <dt className="text-slate-400">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex justify-between border-b border-slate-700 pb-1">
          <dt className="text-slate-400">Активен</dt>
          <dd>{user.is_active ? 'да' : 'нет'}</dd>
        </div>
        <div className="flex justify-between border-b border-slate-700 pb-1">
          <dt className="text-slate-400">Создан</dt>
          <dd>{new Date(user.created_at).toLocaleString()}</dd>
        </div>
      </dl>

      <button
        onClick={onLogout}
        className="mt-6 rounded bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-medium transition-colors"
      >
        Выйти
      </button>
    </div>
  );
}
