import { useState, useEffect } from 'react';
import {
  Workflow as WorkflowIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { DashboardSkeleton } from '@/components/common/Skeleton';
import { cn, formatRelativeTime } from '@/lib/utils';
import { executions } from '@/lib/api';
import type { DashboardStats, Execution } from '@/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExecs, setRecentExecs] = useState<Execution[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await executions.stats();
      setStats(data);
      setRecentExecs(data.recentExecutions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-surface-300" />
        <p className="mt-4 text-surface-600">{error}</p>
        <Button variant="ghost" className="mt-4" onClick={loadData}>Retry</Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <WorkflowIcon className="h-5 w-5 text-primary-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-surface-900">{stats.totalWorkflows}</p>
          <p className="text-sm text-surface-500">Total workflows</p>
        </Card>

        <Card>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-surface-900">{stats.activeWorkflows}</p>
          <p className="text-sm text-surface-500">Active workflows</p>
        </Card>

        <Card>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <BarChart3 className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-surface-900">{stats.executionsToday}</p>
          <p className="text-sm text-surface-500">Executions today</p>
        </Card>

        <Card>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <AlertCircle className="h-5 w-5 text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-surface-900">{stats.successRate}%</p>
          <p className="text-sm text-surface-500">Success rate</p>
        </Card>
      </div>

      {/* Recent executions */}
      <Card padding="none">
        <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-surface-900">Recent Executions</h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/app/executions'}>
            View all
          </Button>
        </div>
        {recentExecs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Clock className="mx-auto h-8 w-8 text-surface-300" />
            <p className="mt-2 text-sm text-surface-500">No executions yet</p>
            <p className="text-xs text-surface-400">Run a workflow to see results here</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {recentExecs.map((exec) => (
              <div
                key={exec.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-surface-50"
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    exec.status === 'success' && 'bg-emerald-50',
                    exec.status === 'failed' && 'bg-rose-50',
                    exec.status === 'running' && 'bg-amber-50'
                  )}
                >
                  {exec.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {exec.status === 'failed' && <AlertCircle className="h-4 w-4 text-rose-500" />}
                  {exec.status === 'running' && <Clock className="h-4 w-4 animate-spin text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {exec.workflowName || 'Untitled'}
                  </p>
                  <p className="text-xs text-surface-400">
                    {formatRelativeTime(exec.startedAt)}
                    {exec.durationMs && ` - ${(exec.durationMs / 1000).toFixed(1)}s`}
                  </p>
                </div>
                <Badge
                  variant={exec.status === 'success' ? 'success' : exec.status === 'failed' ? 'error' : 'warning'}
                  pulse={exec.status === 'running'}
                >
                  {exec.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
