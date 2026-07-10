import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save, ChevronDown, AlertCircle, Download } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import AutoFlowNode from '@/components/workflow/AutoFlowNode';
import NodeConfigPanel from '@/components/workflow/NodeConfigPanel';
import { cn } from '@/lib/utils';
import { humanizeError } from '@/lib/errors';
import { workflows } from '@/lib/api';
import type { WorkflowNode, WorkflowEdge } from '@/types';

const nodeTypes = {
  autoflow: AutoFlowNode,
};

type NodeCategory = 'triggers' | 'actions' | 'logic' | 'apps';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
}

const nodePalette: PaletteItem[] = [
  { type: 'webhook', label: 'Webhook', description: 'Receive data via HTTP request', category: 'triggers' },
  { type: 'schedule', label: 'Schedule', description: 'Run on a time interval', category: 'triggers' },
  { type: 'email_trigger', label: 'Email Trigger', description: 'Trigger on incoming email', category: 'triggers' },
  { type: 'http_request', label: 'HTTP Request', description: 'Make an API call', category: 'actions' },
  { type: 'send_email', label: 'Send Email', description: 'Send an email via SMTP', category: 'actions' },
  { type: 'slack_message', label: 'Slack Message', description: 'Post to a Slack channel', category: 'actions' },
  { type: 'google_sheets', label: 'Google Sheets', description: 'Read/write spreadsheet data', category: 'actions' },
  { type: 'filter', label: 'Filter', description: 'Branch based on conditions', category: 'logic' },
  { type: 'router', label: 'Router', description: 'Route to different paths', category: 'logic' },
  { type: 'delay', label: 'Delay', description: 'Wait for a duration', category: 'logic' },
  { type: 'code', label: 'Code', description: 'Run custom JavaScript', category: 'logic' },
  { type: 'stripe', label: 'Stripe', description: 'Payment & subscription events', category: 'apps' },
  { type: 'shopify', label: 'Shopify', description: 'E-commerce automation', category: 'apps' },
  { type: 'hubspot', label: 'HubSpot', description: 'CRM data & events', category: 'apps' },
  { type: 'notion', label: 'Notion', description: 'Database & pages', category: 'apps' },
  { type: 'airtable', label: 'Airtable', description: 'Base records', category: 'apps' },
];

const categoryLabels: Record<NodeCategory, string> = {
  triggers: 'Triggers',
  actions: 'Actions',
  logic: 'Logic',
  apps: 'Apps',
};

function PaletteItemCard({ item, onAdd }: { item: PaletteItem; onAdd: (item: PaletteItem) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-100"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-100">
        <span className="text-xs font-medium text-surface-600">
          {item.label.slice(0, 3)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-surface-800">{item.label}</p>
        <p className="text-xs text-surface-400">{item.description}</p>
      </div>
    </button>
  );
}

export default function WorkflowEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<'active' | 'draft'>('draft');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<NodeCategory | null>('triggers');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Load workflow if editing
  useEffect(() => {
    if (!isNew && id) {
      loadWorkflow(id);
    }
  }, [id, isNew]);

  async function loadWorkflow(workflowId: string) {
    try {
      const wf = await workflows.get(workflowId);
      setWorkflowName(wf.name);
      setWorkflowStatus(wf.status === 'active' ? 'active' : 'draft');

      const loadedNodes: Node[] = (wf.nodes as WorkflowNode[]).map((n) => ({
        id: n.id,
        type: 'autoflow',
        position: n.position,
        data: { label: n.label, type: n.type, icon: n.type, config: (n as any).config || {} },
      }));
      setNodes(loadedNodes);

      const loadedEdges: Edge[] = (wf.edges as WorkflowEdge[]).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));
      setEdges(loadedEdges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    }
  }

  const handleAddNode = useCallback((item: PaletteItem) => {
    const newNode: Node = {
      id: `${item.type}-${Date.now()}`,
      type: 'autoflow',
      position: { x: 250 + Math.random() * 50, y: 150 + Math.random() * 50 },
      data: { label: item.label, type: item.type, icon: item.type, config: {} },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setRightPanelOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setRightPanelOpen(false);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data } : n))
      );
      // Keep selectedNode in sync
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data } : prev));
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const source = nds.find((n) => n.id === nodeId);
        if (!source) return nds;
        const newNode: Node = {
          ...source,
          id: `${source.data?.type || 'copy'}-${Date.now()}`,
          position: { x: source.position.x + 50, y: source.position.y + 50 },
          data: { ...source.data, label: `${source.data?.label || 'Node'} (copy)` },
        };
        return [...nds, newNode];
      });
    },
    [setNodes]
  );

  // --- Right-click context menu ---
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    []
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'SELECT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode) {
          e.preventDefault();
          handleDeleteNode(selectedNode.id);
          setSelectedNode(null);
          setRightPanelOpen(false);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      if (e.key === 'Escape') {
        setContextMenu(null);
        setSelectedNode(null);
        setRightPanelOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, nodes, edges, workflowName]);

  /** Check if the current graph has a cycle (prevents engine errors before saving). */
  function hasCycle(): boolean {
    const adj = new Map<string, string[]>();
    const visited = new Set<string>();
    const inStack = new Set<string>();

    for (const n of nodes) adj.set(n.id, []);
    for (const e of edges) {
      const list = adj.get(e.source) || [];
      list.push(e.target);
      adj.set(e.source, list);
    }

    function dfs(nodeId: string): boolean {
      visited.add(nodeId);
      inStack.add(nodeId);
      for (const neighbor of adj.get(nodeId) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (inStack.has(neighbor)) {
          return true;
        }
      }
      inStack.delete(nodeId);
      return false;
    }

    for (const n of nodes) {
      if (!visited.has(n.id)) {
        if (dfs(n.id)) return true;
      }
    }
    return false;
  }

  const handleExport = () => {
    const workflowNodes = nodes.map((n) => ({
      id: n.id,
      type: (n.data as any)?.type || 'unknown',
      label: (n.data as any)?.label || 'Untitled',
      config: (n.data as any)?.config || {},
      position: n.position,
    }));
    const workflowEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    const exportData = {
      name: workflowName,
      exportedAt: new Date().toISOString(),
      nodes: workflowNodes,
      edges: workflowEdges,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (edges.length > 0 && hasCycle()) {
      setError('Cycle detected: your connections form a loop. Remove at least one connection to break the cycle.');
      return;
    }
    try {
      setSaving(true);
      setError(null);

      const workflowNodes: WorkflowNode[] = nodes.map((n) => ({
        id: n.id,
        type: (n.data as any)?.type || 'unknown',
        label: (n.data as any)?.label || 'Untitled',
        position: n.position,
        config: (n.data as any)?.config || {},
      }));

      const workflowEdges: WorkflowEdge[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));

      if (isNew) {
        const created = await workflows.create({ name: workflowName });
        await workflows.update(created.id, {
          nodes: workflowNodes,
          edges: workflowEdges,
          status: 'draft',
        });
        navigate(`/app/workflows/${created.id}`, { replace: true });
      } else if (id) {
        await workflows.update(id, {
          name: workflowName,
          nodes: workflowNodes,
          edges: workflowEdges,
          status: 'draft',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    try {
      setRunning(true);
      setError(null);
      await handleSave(); // Save first
      if (id) {
        await workflows.run(id);
        navigate('/app/executions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)]">
      {/* Left sidebar - Node palette */}
      <div className="w-64 shrink-0 overflow-y-auto border-r border-surface-200 bg-white">
        <div className="border-b border-surface-100 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400">Nodes</h3>
        </div>
        <div className="p-2">
          {(['triggers', 'actions', 'logic', 'apps'] as NodeCategory[]).map((category) => (
            <div key={category} className="mb-1">
              <button
                type="button"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100"
              >
                {categoryLabels[category]}
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    expandedCategory === category && 'rotate-180'
                  )}
                />
              </button>
              {expandedCategory === category && (
                <div className="mt-1">
                  {nodePalette
                    .filter((n) => n.category === category)
                    .map((item) => (
                      <PaletteItemCard key={item.type} item={item} onAdd={handleAddNode} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center - Flow canvas */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2">
          <div className="flex items-center gap-3">
            <Link
              to="/app/workflows"
              className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="rounded-md border border-transparent px-2 py-1 text-sm font-semibold text-surface-900 hover:border-surface-200 focus:border-primary-400 focus:outline-none"
            />
            <Badge variant={workflowStatus === 'active' ? 'success' : 'neutral'}>
              {workflowStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <div className="flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3 w-3" />
                {humanizeError(error)}
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={handleRun} loading={running}>
              <Play className="h-4 w-4" />
              Run
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Strict}
            defaultEdgeOptions={{
              type: 'default',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
              style: { strokeWidth: 2, stroke: '#6366f1' },
            }}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
            <Controls className="rounded-lg border border-surface-200 bg-white shadow-sm" />
            <MiniMap
              className="rounded-lg border border-surface-200 bg-surface-50"
              maskColor="rgba(15, 23, 42, 0.08)"
              nodeColor="#6366f1"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Right sidebar - Node config */}
      {rightPanelOpen && selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => { setRightPanelOpen(false); setSelectedNode(null); }}
        />
      )}
      {/* Right-click context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }} />
          <div
            className="fixed z-50 w-44 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-lg py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
              onClick={() => { handleDuplicateNode(contextMenu.nodeId); closeContextMenu(); }}
            >
              Duplicate
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              onClick={() => { handleDeleteNode(contextMenu.nodeId); setSelectedNode(null); setRightPanelOpen(false); closeContextMenu(); }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
