export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: WorkflowStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt: string | null;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export type WorkflowStatus = 'active' | 'draft' | 'error';

export interface Execution {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  steps: ExecutionStep[];
  errorMessage: string | null;
}

export interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  status: StepStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

export type ExecutionStatus = 'running' | 'success' | 'failed';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
}

export type Plan = 'free' | 'maker' | 'team' | 'business';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  executionsToday: number;
  successRate: number;
  recentExecutions: Execution[];
}
