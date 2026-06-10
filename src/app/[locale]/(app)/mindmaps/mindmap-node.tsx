'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { HelpCircle, ThumbsDown, ThumbsUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NODE_KINDS = ['topic', 'idea', 'pro', 'con', 'question'] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export type MindmapNodeData = { label: string; kind: NodeKind };
export type MindmapNode = Node<MindmapNodeData, 'mindmap'>;

const kindStyles: Record<NodeKind, { box: string; icon?: LucideIcon; iconClass?: string }> = {
  topic: {
    box: 'border-primary-700/30 bg-primary-600 font-bold text-white shadow-md',
  },
  idea: {
    box: 'border-slate-200 bg-white text-slate-700',
  },
  pro: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: ThumbsUp,
    iconClass: 'text-emerald-600',
  },
  con: {
    box: 'border-red-200 bg-red-50 text-red-800',
    icon: ThumbsDown,
    iconClass: 'text-red-500',
  },
  question: {
    box: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: HelpCircle,
    iconClass: 'text-amber-500',
  },
};

const handleClass = 'h-2! w-2! rounded-full! border-none! bg-slate-300!';

function MindmapNodeInner({ data, selected }: NodeProps<MindmapNode>) {
  const styles = kindStyles[data.kind] ?? kindStyles.idea;
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        'flex min-h-11 max-w-64 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-shadow',
        styles.box,
        selected && 'ring-2 ring-primary-400 ring-offset-2',
      )}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      {Icon && <Icon className={cn('h-4 w-4 shrink-0', styles.iconClass)} />}
      <span className="break-words leading-snug">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className={handleClass} />
    </div>
  );
}

export const MindmapNodeView = memo(MindmapNodeInner);
