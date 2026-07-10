import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow as WorkflowIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  ArrowRight,
  FileText,
  MessageSquare,
  CreditCard,
  Table2,
  Building2,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { DashboardSkeleton } from '@/components/common/Skeleton';
import { cn, formatRelativeTime } from '@/lib/utils';
import { executions } from '@/lib/api';
import type { DashboardStats, Execution } from '@/types';

const quickStartGuides = [
  { icon: MessageSquare, title: 'Slack order notifications', desc: 'Send a Slack message when a new order arrives', step: 1 },
  { icon: CreditCard, title: 'Payment alerts', desc: 'Alert your team when a Stripe payment succeeds', step: 2 },
  { icon: Table2, title: 'Daily data backup', desc: 'Auto-save API data to Google Sheets every night', step: 3 },
  { icon: Building2, title: 'Lead capture CRM', desc: 'Capture form leads and auto-create HubSpot contacts', step: 4 },
  { icon: FileText, title: 'Form to Notion', desc: 'Log form submissions directly into a Notion database', step: 5 },
];

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
      {/* Onboarding for new users */}
      {stats.totalWorkflows === 0 && (
        <Card padding="lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <svg viewBox="0 0 64 64" fill="none" className="h-8 w-8" aria-hidden="true">
                <circle cx="16" cy="32" r="6" stroke="#6366f1" strokeWidth="2.5" />
                <circle cx="48" cy="20" r="6" stroke="#818cf8" strokeWidth="2.5" />
                <circle cx="48" cy="44" r="6" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="22" y1="32" x2="42" y2="22" stroke="#6366f1" strokeWidth="2" />
                <line x1="22" y1="32" x2="42" y2="42" stroke="#6366f1" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-surface-900">Welcome to AutoFlow</h2>
            <p className="mt-2 text-surface-500 max-w-md mx-auto">
              Build your first workflow in minutes. Here is what you can automate:
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickStartGuides.map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-3 rounded-lg border border-surface-200 p-4 hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => window.location.href = '/app/workflows?from=dashboard'}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <item.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-800">{item.title}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/app/workflows/new">
              <Button>
                Create Your First Workflow
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/app/workflows?tab=templates">
              <Button variant="secondary">
                Start from a Template
              </Button>
            </Link>
          </div>
        </Card>
      )}

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
