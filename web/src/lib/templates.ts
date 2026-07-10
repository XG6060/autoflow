import type { WorkflowNode, WorkflowEdge } from '@/types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const templates: WorkflowTemplate[] = [
  {
    id: 'tpl-slack-order',
    name: 'Order Notification to Slack',
    description: 'When a new order comes in, check the amount and send a notification to your Slack channel.',
    category: 'E-commerce',
    icon: 'cart',
    nodes: [
      { id: 'webhook-1', type: 'webhook', label: 'New Order', config: { method: 'POST' }, position: { x: 250, y: 0 } },
      { id: 'filter-1', type: 'filter', label: 'Amount over $50?', config: { field: 'amount', operator: 'greater_than', value: 50 }, position: { x: 250, y: 150 } },
      { id: 'slack-1', type: 'slack_message', label: 'Notify #orders', config: { channel: '#orders', text: 'New order: {{.orderId}} - ${{.amount}}' }, position: { x: 250, y: 300 } },
    ],
    edges: [
      { id: 'e1-1', source: 'webhook-1', target: 'filter-1' },
      { id: 'e1-2', source: 'filter-1', target: 'slack-1' },
    ],
  },
  {
    id: 'tpl-stripe-alert',
    name: 'Payment Success Alert',
    description: 'Send Slack and Email notifications when a Stripe payment succeeds.',
    category: 'Finance',
    icon: 'credit',
    nodes: [
      { id: 'webhook-1', type: 'webhook', label: 'Stripe Webhook', config: { method: 'POST' }, position: { x: 100, y: 0 } },
      { id: 'filter-1', type: 'filter', label: 'Payment Succeeded?', config: { field: 'type', operator: 'equals', value: 'payment_intent.succeeded' }, position: { x: 100, y: 150 } },
      { id: 'slack-1', type: 'slack_message', label: 'Notify #finance', config: { channel: '#finance', text: 'Payment received: ${{.amount}}' }, position: { x: 0, y: 300 } },
      { id: 'email-1', type: 'send_email', label: 'Send Receipt', config: { to: 'finance@example.com', subject: 'Payment Confirmation' }, position: { x: 200, y: 300 } },
    ],
    edges: [
      { id: 'e2-1', source: 'webhook-1', target: 'filter-1' },
      { id: 'e2-2', source: 'filter-1', target: 'slack-1' },
      { id: 'e2-3', source: 'filter-1', target: 'email-1' },
    ],
  },
  {
    id: 'tpl-sheets-backup',
    name: 'Daily Database Backup',
    description: 'Run every day at midnight: fetch data from your API and append to a Google Sheet.',
    category: 'Data',
    icon: 'table',
    nodes: [
      { id: 'schedule-1', type: 'schedule', label: 'Every Day 00:00', config: { cron: '0 0 * * *' }, position: { x: 250, y: 0 } },
      { id: 'http-1', type: 'http_request', label: 'Fetch Data', config: { url: 'https://api.example.com/data', method: 'GET' }, position: { x: 250, y: 150 } },
      { id: 'transform-1', type: 'transform', label: 'Format for Sheets', config: { code: '{"rows": {{.data}}}' }, position: { x: 250, y: 300 } },
      { id: 'sheets-1', type: 'google_sheets', label: 'Append to Sheet', config: { spreadsheetId: 'your-sheet-id', range: 'Sheet1!A:Z' }, position: { x: 250, y: 450 } },
    ],
    edges: [
      { id: 'e3-1', source: 'schedule-1', target: 'http-1' },
      { id: 'e3-2', source: 'http-1', target: 'transform-1' },
      { id: 'e3-3', source: 'transform-1', target: 'sheets-1' },
    ],
  },
  {
    id: 'tpl-hubspot-lead',
    name: 'Lead Capture to HubSpot',
    description: 'Capture leads from a webhook, enrich with an API call, and create a contact in HubSpot.',
    category: 'Marketing',
    icon: 'building',
    nodes: [
      { id: 'webhook-1', type: 'webhook', label: 'Form Submission', config: { method: 'POST' }, position: { x: 250, y: 0 } },
      { id: 'http-1', type: 'http_request', label: 'Enrich Lead Data', config: { url: 'https://api.clearbit.com/v2/people/find', method: 'GET' }, position: { x: 250, y: 150 } },
      { id: 'transform-1', type: 'transform', label: 'Map to HubSpot', config: { code: '{"email":"{{.email}}","name":"{{.name}}","company":"{{.company}}"}' }, position: { x: 250, y: 300 } },
      { id: 'hubspot-1', type: 'hubspot', label: 'Create Contact', config: { action: 'create_contact' }, position: { x: 250, y: 450 } },
    ],
    edges: [
      { id: 'e4-1', source: 'webhook-1', target: 'http-1' },
      { id: 'e4-2', source: 'http-1', target: 'transform-1' },
      { id: 'e4-3', source: 'transform-1', target: 'hubspot-1' },
    ],
  },
  {
    id: 'tpl-notion-form',
    name: 'Form Responses to Notion',
    description: 'When someone submits a form, transform the data and log it to a Notion database.',
    category: 'Productivity',
    icon: 'file',
    nodes: [
      { id: 'webhook-1', type: 'webhook', label: 'Form Webhook', config: { method: 'POST' }, position: { x: 250, y: 0 } },
      { id: 'filter-1', type: 'filter', label: 'Has Email?', config: { field: 'email', operator: 'exists' }, position: { x: 250, y: 150 } },
      { id: 'transform-1', type: 'transform', label: 'Format Entry', config: { code: '{"Name":"{{.name}}","Email":"{{.email}}","Message":"{{.message}}"}' }, position: { x: 250, y: 300 } },
      { id: 'notion-1', type: 'notion', label: 'Add to Database', config: { action: 'create_page', database: 'your-db-id' }, position: { x: 250, y: 450 } },
    ],
    edges: [
      { id: 'e5-1', source: 'webhook-1', target: 'filter-1' },
      { id: 'e5-2', source: 'filter-1', target: 'transform-1' },
      { id: 'e5-3', source: 'transform-1', target: 'notion-1' },
    ],
  },
];

export const templateCategories = [...new Set(templates.map((t) => t.category))];
