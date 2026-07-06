/// <reference types="vite/client" />

import type { Workflow, Execution, DashboardStats, User, ApiKey } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('autoflow-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(error.message || 'Request failed', response.status);
  }

  return response.json();
}

// Auth
export const auth = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<User>('/auth/me'),

  createApiKey: (name: string) =>
    request<ApiKey>('/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteApiKey: (id: string) =>
    request<void>(`/auth/api-keys/${id}`, { method: 'DELETE' }),
};

// Workflows
export const workflows = {
  list: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return request<Workflow[]>(`/workflows${params}`);
  },

  get: (id: string) => request<Workflow>(`/workflows/${id}`),

  create: (data: { name: string; description?: string }) =>
    request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Workflow>) =>
    request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/workflows/${id}`, { method: 'DELETE' }),

  run: (id: string) =>
    request<Execution>(`/workflows/${id}/run`, { method: 'POST' }),
};

// Executions
export const executions = {
  list: (params?: { workflowId?: string; status?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.workflowId) searchParams.set('workflowId', params.workflowId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const qs = searchParams.toString();
    return request<Execution[]>(`/executions${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => request<Execution>(`/executions/${id}`),

  stats: () => request<DashboardStats>('/executions/stats'),
};

export { ApiError };
