import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import { workflows } from '@/lib/api';
import type { Workflow } from '@/types';

type FilterType = 'all' | 'active' | 'draft' | 'error';

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [workflowList, setWorkflowList] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      setLoading(true);
      const data = await workflows.list(filter === 'all' ? undefined : filter);
      setWorkflowList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  const filtered = workflowList.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Workflows</h2>
          <p className="text-sm text-surface-500">Manage and monitor your automations</p>
        </div>
        <Link to="/app/workflows/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['all', 'active', 'draft', 'error'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-surface-200 py-2 pl-10 pr-4 text-sm text-surface-800 placeholder-surface-400 focus:border-primary-400 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span className="text-sm text-rose-700">{error}</span>
          <Button variant="ghost" size="sm" onClick={loadWorkflows}>Retry</Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-white p-5 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-surface-200" />
              <div className="mt-2 h-3 w-full rounded bg-surface-100" />
              <div className="mt-4 h-10 rounded-lg bg-surface-100" />
              <div className="mt-3 h-3 w-1/3 rounded bg-surface-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
            <svg viewBox="0 0 64 64" fill="none" className="h-8 w-8" aria-hidden="true">
              <circle cx="16" cy="32" r="6" stroke="#6366f1" strokeWidth="2.5" />
              <circle cx="48" cy="20" r="6" stroke="#818cf8" strokeWidth="2.5" />
              <circle cx="48" cy="44" r="6" stroke="#818cf8" strokeWidth="2.5" />
              <line x1="22" y1="32" x2="42" y2="22" stroke="#6366f1" strokeWidth="2" />
              <line x1="22" y1="32" x2="42" y2="42" stroke="#6366f1" strokeWidth="2" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-surface-900">
            {search ? 'No matching workflows' : 'Create your first workflow'}
          </h3>
          <p className="mt-1 text-sm text-surface-500">
            {search ? 'Try a different search term' : 'Build an automation in minutes with our visual editor'}
          </p>
          {!search && (
            <Link to="/app/workflows/new" className="mt-6">
              <Button>
                <Plus className="h-4 w-4" />
                Create Workflow
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workflow) => (
            <Link
              key={workflow.id}
              to={`/app/workflows/${workflow.id}`}
              className="group rounded-xl border border-surface-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-surface-900 truncate group-hover:text-primary-600">
                    {workflow.name}
                  </h3>
                  <p className="mt-1 text-xs text-surface-500 line-clamp-2">
                    {workflow.description || 'No description'}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-2 rounded p-1 text-surface-300 opacity-0 transition-opacity hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  title="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Mini node preview */}
              <div className="mt-4 flex items-center justify-center rounded-lg bg-surface-50 py-4">
                <svg viewBox="0 0 200 40" className="h-10 w-full" aria-hidden="true">
                  {[30, 70, 110, 150].map((cx, i) => (
                    <g key={i}>
                      <circle cx={cx} cy="20" r="8" fill="none" stroke="#c7d2fe" strokeWidth="2" />
                      <circle cx={cx} cy="20" r="3" fill="#6366f1" />
                    </g>
                  ))}
                  <line x1="38" y1="20" x2="62" y2="20" stroke="#c7d2fe" strokeWidth="1.5" />
                  <line x1="78" y1="20" x2="102" y2="20" stroke="#c7d2fe" strokeWidth="1.5" />
                  <line x1="118" y1="20" x2="142" y2="20" stroke="#c7d2fe" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge
                  variant={
                    workflow.status === 'active' ? 'success' :
                    workflow.status === 'error' ? 'error' : 'neutral'
                  }
                  pulse={workflow.status === 'active'}
                >
                  {workflow.status}
                </Badge>
                <span className="text-xs text-surface-400">
                  {workflow.lastRunAt ? formatRelativeTime(workflow.lastRunAt) : 'Never run'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
