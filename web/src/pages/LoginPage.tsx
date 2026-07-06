import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';

export default function LoginPage() {
  const { login, user, token, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user && token) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="8" cy="16" r="3" fill="white" />
                <circle cx="24" cy="8" r="3" fill="white" />
                <circle cx="24" cy="24" r="3" fill="white" />
                <path d="M11 16h4l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 16h4l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900">AutoFlow</span>
          </Link>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-surface-900">Sign in</h1>
          <p className="mt-1 text-sm text-surface-500">Enter your credentials to continue</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 pl-10 pr-3 text-sm text-surface-900 placeholder-surface-400 focus:border-primary-400 focus:bg-white focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  required
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 pl-10 pr-3 text-sm text-surface-900 placeholder-surface-400 focus:border-primary-400 focus:bg-white focus:outline-none"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-surface-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
