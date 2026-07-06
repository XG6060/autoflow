import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Node } from '@xyflow/react';
import Button from '@/components/common/Button';

interface NodeConfigPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

const nodeConfigs: Record<string, FieldDef[]> = {
  webhook: [
    { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT'].map((v) => ({ value: v, label: v })), defaultValue: 'POST' },
    { key: 'response', label: 'Mock Response (JSON)', type: 'text', placeholder: '{"status":"ok"}', defaultValue: '' },
  ],
  http_request: [
    { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/data', defaultValue: '' },
    { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((v) => ({ value: v, label: v })), defaultValue: 'GET' },
    { key: 'headers', label: 'Headers (JSON)', type: 'text', placeholder: '{"Authorization":"Bearer ..."}', defaultValue: '' },
    { key: 'body', label: 'Request Body', type: 'text', placeholder: '{"key":"value"}', defaultValue: '' },
  ],
  schedule: [
    { key: 'cron', label: 'Cron Expression', type: 'text', placeholder: '*/5 * * * *', defaultValue: '' },
    { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'UTC', defaultValue: 'UTC' },
  ],
  email_trigger: [
    { key: 'from', label: 'From Address', type: 'text', placeholder: 'trigger@example.com', defaultValue: '' },
    { key: 'subject', label: 'Subject Filter', type: 'text', placeholder: 'Order', defaultValue: '' },
  ],
  slack_message: [
    { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', defaultValue: '' },
    { key: 'text', label: 'Message Text', type: 'text', placeholder: 'Hello {{.name}}!', defaultValue: '' },
    { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...', defaultValue: '' },
  ],
  send_email: [
    { key: 'to', label: 'To', type: 'text', placeholder: 'user@example.com', defaultValue: '' },
    { key: 'subject', label: 'Subject', type: 'text', placeholder: 'AutoFlow notification', defaultValue: '' },
    { key: 'body', label: 'Body', type: 'text', placeholder: 'Hello {{.name}}', defaultValue: '' },
  ],
  google_sheets: [
    { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: '1abc...', defaultValue: '' },
    { key: 'range', label: 'Range', type: 'text', placeholder: 'Sheet1!A1:D10', defaultValue: '' },
    { key: 'action', label: 'Action', type: 'select', options: ['read', 'append', 'update'].map((v) => ({ value: v, label: v })), defaultValue: 'append' },
  ],
  filter: [
    { key: 'field', label: 'Field', type: 'text', placeholder: 'body.amount', defaultValue: '' },
    { key: 'operator', label: 'Operator', type: 'select', options: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'exists'].map((v) => ({ value: v, label: v })), defaultValue: 'equals' },
    { key: 'value', label: 'Value', type: 'text', placeholder: '100', defaultValue: '' },
  ],
  router: [
    { key: 'field', label: 'Route Field', type: 'text', placeholder: 'status', defaultValue: '' },
    { key: 'branches', label: 'Branches (comma-sep)', type: 'text', placeholder: 'approved,rejected', defaultValue: '' },
  ],
  delay: [
    { key: 'seconds', label: 'Delay (seconds)', type: 'number', placeholder: '5', defaultValue: 1 },
  ],
  code: [
    { key: 'code', label: 'JavaScript Code', type: 'text', placeholder: 'return { result: input.value * 2 };', defaultValue: '' },
  ],
  transform: [
    { key: 'code', label: 'Template / Code', type: 'text', placeholder: '{"output": "{{.input}}"}', defaultValue: '' },
  ],
  stripe: [
    { key: 'event', label: 'Event Type', type: 'select', options: ['payment_intent.succeeded', 'customer.created', 'invoice.paid'].map((v) => ({ value: v, label: v })), defaultValue: 'payment_intent.succeeded' },
    { key: 'secretKey', label: 'Secret Key', type: 'text', placeholder: 'sk_live_...', defaultValue: '' },
  ],
  shopify: [
    { key: 'event', label: 'Event', type: 'select', options: ['orders/create', 'customers/create', 'products/update'].map((v) => ({ value: v, label: v })), defaultValue: 'orders/create' },
    { key: 'shop', label: 'Shop Domain', type: 'text', placeholder: 'my-store.myshopify.com', defaultValue: '' },
  ],
  hubspot: [
    { key: 'action', label: 'Action', type: 'select', options: ['create_contact', 'update_contact', 'create_deal'].map((v) => ({ value: v, label: v })), defaultValue: 'create_contact' },
    { key: 'apiKey', label: 'API Key', type: 'text', placeholder: '...', defaultValue: '' },
  ],
  notion: [
    { key: 'database', label: 'Database ID', type: 'text', placeholder: 'abc123...', defaultValue: '' },
    { key: 'action', label: 'Action', type: 'select', options: ['create_page', 'update_page', 'query'].map((v) => ({ value: v, label: v })), defaultValue: 'create_page' },
  ],
  airtable: [
    { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'app...', defaultValue: '' },
    { key: 'table', label: 'Table Name', type: 'text', placeholder: 'Table 1', defaultValue: '' },
    { key: 'action', label: 'Action', type: 'select', options: ['list', 'create', 'update'].map((v) => ({ value: v, label: v })), defaultValue: 'create' },
  ],
};

function getFieldsForType(nodeType: string): FieldDef[] {
  return nodeConfigs[nodeType] || [];
}

export default function NodeConfigPanel({ node, onUpdateNode, onDeleteNode, onClose }: NodeConfigPanelProps) {
  const nodeType = (node.data?.type as string) || 'unknown';
  const fields = getFieldsForType(nodeType);
  const existingConfig = (node.data?.config as Record<string, unknown>) || {};
  const isTrigger = ['webhook', 'schedule', 'email_trigger'].includes(nodeType);

  // Local state for each field value
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    // Initialize values from existing config or defaults
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      init[f.key] = existingConfig[f.key] ?? f.defaultValue ?? '';
    }
    setValues(init);
  }, [node.id, nodeType]);

  const handleChange = (key: string, value: unknown) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onUpdateNode(node.id, { ...node.data, config: newValues });
  };

  const handleDelete = () => {
    onDeleteNode(node.id);
    onClose();
  };

  return (
    <div className="w-80 shrink-0 flex flex-col h-full border-l border-surface-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-surface-900">Node Configuration</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Node info */}
      <div className="border-b border-surface-100 px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">{nodeType}</span>
          {isTrigger && <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Trigger</span>}
        </div>
        <div>
          <label className="block text-[11px] text-surface-400">Label</label>
          <input
            type="text"
            value={(node.data?.label as string) || ''}
            onChange={(e) => onUpdateNode(node.id, { ...node.data, label: e.target.value })}
            className="mt-0.5 w-full rounded-md border border-surface-200 px-2.5 py-1.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {fields.length === 0 ? (
          <p className="text-xs text-surface-400">No configurable fields for this node type.</p>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-surface-700">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={(values[field.key] as string) || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="mt-1 w-full rounded-md border border-surface-200 px-3 py-1.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none"
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={(values[field.key] as string | number) || ''}
                    onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded-md border border-surface-200 px-3 py-1.5 text-sm text-surface-800 placeholder-surface-300 focus:border-primary-400 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-surface-100 p-4">
        <Button variant="danger" size="sm" className="w-full" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
