import { create } from 'zustand';
import { auth } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await auth.login({ email, password });
      localStorage.setItem('autoflow-token', result.token);
      set({ token: result.token, user: result.user, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, loading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const result = await auth.register({ email, password, name });
      localStorage.setItem('autoflow-token', result.token);
      set({ token: result.token, user: result.user, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('autoflow-token');
    set({ user: null, token: null });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('autoflow-token');
    if (token) {
      set({ token });
      auth
        .me()
        .then((user) => set({ user }))
        .catch(() => {
          localStorage.removeItem('autoflow-token');
          set({ token: null, user: null });
        });
    }
  },

  clearError: () => set({ error: null }),
}));
