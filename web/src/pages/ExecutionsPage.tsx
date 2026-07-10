import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { cn, formatDateTime, formatDuration } from '@/lib/utils';
import { humanizeError } from '@/lib/errors';
import { executions } from '@/lib/api';
import type { Execution } from '@/types';

export default function ExecutionsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [execList, setExecList] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExecutions();
  }, [statusFilter]);

  async function loadExecutions() {
    try {
      setLoading(true);
      const data = await executions.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50,
      });
      setExecList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  const filtered = execList;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Execution History</h2>
        <p className="text-sm text-surface-500">Monitor the health of your automations</p>
      </div>

      <div className="flex gap-2">
        {['all', 'success', 'failed', 'running'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
              statusFilter === s
                ? 'bg-primary-50 text-primary-700'
                : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
            )}
          >
            {s}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={loadExecutions} loading={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span className="text-sm text-rose-700">{error}</span>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-100" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Clock className="h-12 w-12 text-surface-300" />
          <p className="mt-4 text-surface-600">No executions yet</p>
          <p className="text-sm text-surface-400">Run a workflow to see results here</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <Card padding="none">
          <div className="divide-y divide-surface-100">
            {filtered.map((exec) => (
              <div key={exec.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                  className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-surface-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    {expandedId === exec.id ? (
                      <ChevronDown className="h-4 w-4 text-surface-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-surface-400" />
                    )}
                  </div>
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
                      {exec.steps ? exec.steps.filter((s: any) => s.status === 'success').length : 0}/{exec.steps ? exec.steps.length : 0} steps
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-surface-500">{formatDateTime(exec.startedAt)}</p>
                    {exec.durationMs && (
                      <p className="text-xs text-surface-400">{formatDuration(exec.durationMs)}</p>
                    )}
                  </div>
                  <Badge
                    variant={exec.status === 'success' ? 'success' : exec.status === 'failed' ? 'error' : 'warning'}
                    pulse={exec.status === 'running'}
                  >
                    {exec.status}
                  </Badge>
                </button>

                {expandedId === exec.id && (
                  <div className="border-t border-surface-100 bg-surface-50 px-5 py-3">
                    {exec.errorMessage && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                        <p className="text-sm font-medium text-rose-700">Error</p>
                        <p className="mt-1 text-sm text-rose-600">{humanizeError(exec.errorMessage)}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {exec.steps?.map((step, idx) => (
                        <div
                          key={step.nodeId}
                          className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 border border-surface-200"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-100 text-xs font-medium text-surface-500">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-surface-800">{step.nodeLabel}</p>
                          </div>
                          <Badge
                            variant={step.status === 'success' ? 'success' : step.status === 'failed' ? 'error' : step.status === 'skipped' ? 'neutral' : 'warning'}
                          >
                            {step.status}
                          </Badge>
                          {step.durationMs && (
                            <span className="text-xs text-surface-400">
                              {formatDuration(step.durationMs)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
