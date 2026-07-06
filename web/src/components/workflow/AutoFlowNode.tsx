import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function AutoFlowNode({ data, selected }: NodeProps) {
  const label = (data?.label as string) || 'Node';
  const nodeType = (data?.type as string) || 'unknown';
  const isTrigger = nodeType === 'webhook' || nodeType === 'schedule' || nodeType === 'email_trigger';

  const iconText = label.slice(0, 3);

  return (
    <div
      className={`
        relative min-w-[160px] rounded-xl border-2 bg-white px-4 pt-4 pb-3 shadow-sm transition-all
        ${selected ? 'border-primary-500 shadow-md ring-2 ring-primary-100' : 'border-surface-200 hover:border-surface-300 hover:shadow-md'}
      `}
    >
      {/* ---- Top handle: INPUT (target) - receives connections ---- */}
      {!isTrigger && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Handle
            type="target"
            position={Position.Top}
            className="!static !h-5 !w-5 !rounded-full !border-2 !border-white !bg-emerald-500 !transition-all hover:!h-6 hover:!w-6 hover:!shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
          />
        </div>
      )}

      {/* ---- Trigger badge ---- */}
      {isTrigger && (
        <div className="absolute -top-2.5 left-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          START
        </div>
      )}

      {/* ---- Node body ---- */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold uppercase text-primary-600">
          {iconText}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-800 truncate">{label}</p>
          <p className="text-[11px] text-surface-400">{nodeType}</p>
        </div>
      </div>

      {/* ---- Bottom handle: OUTPUT (source) - sends connections ---- */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <Handle
          type="source"
          position={Position.Bottom}
          className="!static !h-5 !w-5 !rounded-full !border-2 !border-white !bg-primary-500 !transition-all hover:!h-6 hover:!w-6 hover:!shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
        />
      </div>
    </div>
  );
}

export default memo(AutoFlowNode);
