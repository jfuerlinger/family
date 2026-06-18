'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Input, Label, Select } from '@/components/ui/input';
import { renameMindmap, saveMindmap } from '@/lib/actions/mindmaps';
import { applyAutoLayout, type LayoutDirection } from '@/lib/mindmap-layout';
import { MindmapNodeView, NODE_KINDS, type MindmapNode, type NodeKind } from './mindmap-node';

const nodeTypes = { mindmap: MindmapNodeView };
const defaultEdgeOptions = { style: { stroke: '#cbd5e1', strokeWidth: 2 } };

type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

interface EditingNode {
  id: string;
  label: string;
  kind: NodeKind;
}

interface MindmapEditorProps {
  id: string;
  title: string;
  initialNodes: MindmapNode[];
  initialEdges: Edge[];
}

const quickAddKinds: { kind: NodeKind; icon: LucideIcon; iconClass: string }[] = [
  { kind: 'idea', icon: Lightbulb, iconClass: 'text-slate-500' },
  { kind: 'pro', icon: ThumbsUp, iconClass: 'text-emerald-600' },
  { kind: 'con', icon: ThumbsDown, iconClass: 'text-red-500' },
  { kind: 'question', icon: HelpCircle, iconClass: 'text-amber-500' },
];

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Strip transient React Flow state (selected, measured, …) before persisting. */
function serialize(nodes: MindmapNode[], edges: Edge[]) {
  return {
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: edges.map(({ id, source, target }) => ({ id, source, target })),
  };
}

export function MindmapEditor({ id, title: initialTitle, initialNodes, initialEdges }: MindmapEditorProps) {
  const t = useTranslations('mindmaps');
  const [nodes, setNodes, onNodesChange] = useNodesState<MindmapNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [editing, setEditing] = useState<EditingNode | null>(null);
  const [pendingDeleteNodeId, setPendingDeleteNodeId] = useState<string | null>(null);
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('vertical');

  const lastSavedRef = useRef(JSON.stringify(serialize(initialNodes, initialEdges)));
  const lastTitleRef = useRef(initialTitle);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? nodes.find((node) => node.id === 'root') ?? nodes[0],
    [nodes],
  );

  const persist = useCallback(
    async (currentNodes: MindmapNode[], currentEdges: Edge[]) => {
      const payload = serialize(currentNodes, currentEdges);
      const json = JSON.stringify(payload);
      if (json === lastSavedRef.current) {
        setSaveState('saved');
        return;
      }
      setSaveState('saving');
      try {
        const result = await saveMindmap(id, payload.nodes, payload.edges);
        if (result?.ok) {
          lastSavedRef.current = json;
          setSaveState('saved');
        } else {
          setSaveState('error');
        }
      } catch {
        setSaveState('error');
      }
    },
    [id],
  );

  // Auto-save with debounce after any structural change.
  useEffect(() => {
    const json = JSON.stringify(serialize(nodes, edges));
    if (json === lastSavedRef.current) return;
    setSaveState((state) => (state === 'saving' ? state : 'dirty'));
    const timer = setTimeout(() => persist(nodes, edges), 1500);
    return () => clearTimeout(timer);
  }, [nodes, edges, persist]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const openEditor = useCallback((node: MindmapNode) => {
    setEditing({ id: node.id, label: node.data.label, kind: node.data.kind });
  }, []);

  const addChild = useCallback(
    (kind: NodeKind) => {
      const parent = selectedNode;
      if (!parent) return;
      const childCount = edges.filter((edge) => edge.source === parent.id).length;
      const childId = newId();
      const label = t(`defaultLabels.${kind}`);
      const child: MindmapNode = {
        id: childId,
        type: 'mindmap',
        position: {
          x: parent.position.x + 280,
          y: parent.position.y + childCount * 80 - 40,
        },
        data: { label, kind },
        selected: true,
      };
      setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), child]);
      setEdges((current) => [...current, { id: `e-${parent.id}-${childId}`, source: parent.id, target: childId }]);
      setEditing({ id: childId, label, kind });
    },
    [selectedNode, edges, setNodes, setEdges, t],
  );

  const addTopic = useCallback(() => {
    const topicId = newId();
    setNodes([
      {
        id: topicId,
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: title || t('defaultLabels.topic'), kind: 'topic' },
        selected: true,
      },
    ]);
  }, [setNodes, title, t]);

  const applyEdit = useCallback(() => {
    if (!editing) return;
    const label = editing.label.trim();
    if (!label) return;
    setNodes((current) =>
      current.map((node) =>
        node.id === editing.id ? { ...node, data: { label, kind: editing.kind } } : node,
      ),
    );
    setEditing(null);
  }, [editing, setNodes]);

  const requestDeleteNode = useCallback((nodeId: string) => setPendingDeleteNodeId(nodeId), []);

  const confirmDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setEditing(null);
      setPendingDeleteNodeId(null);
    },
    [setNodes, setEdges],
  );

  const commitTitle = useCallback(() => {
    const value = title.trim();
    if (!value) {
      setTitle(lastTitleRef.current);
      return;
    }
    if (value === lastTitleRef.current) return;
    lastTitleRef.current = value;
    void renameMindmap(id, value);
  }, [id, title]);

  const applyLayout = useCallback(() => {
    const layoutedNodes = applyAutoLayout(nodes, edges, layoutDirection);
    setNodes(layoutedNodes);
  }, [nodes, edges, layoutDirection, setNodes]);

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <Link
          href="/mindmaps"
          aria-label={t('back')}
          title={t('back')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          maxLength={120}
          aria-label={t('titleLabel')}
          className="h-10 min-w-0 flex-1 border-transparent bg-transparent text-base font-semibold text-slate-900 shadow-none hover:border-slate-200 md:text-lg"
        />
        <SaveIndicator state={saveState} t={t} />
        <Button
          variant="outline"
          size="sm"
          className="h-10 shrink-0"
          onClick={() => persist(nodes, edges)}
          disabled={saveState === 'saving' || saveState === 'saved'}
        >
          {t('saveNow')}
        </Button>
      </div>

      {/* Layout control bar */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <LayoutGrid className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-600">{t('editor.autoLayout')}</span>
        <Select
          value={layoutDirection}
          onChange={(event) => setLayoutDirection(event.target.value as LayoutDirection)}
          className="h-9"
        >
          <option value="vertical">{t('editor.layoutVertical')}</option>
          <option value="horizontal">{t('editor.layoutHorizontal')}</option>
        </Select>
        <Button
          size="sm"
          onClick={applyLayout}
          disabled={nodes.length === 0}
          title={t('editor.autoLayoutDesc')}
        >
          {t('editor.autoLayout')}
        </Button>
      </div>

      {/* Canvas */}
      <Card className="relative h-[calc(100dvh-12rem)] overflow-hidden md:h-[calc(100dvh-8rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={(_, node) => openEditor(node)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeOrigin={[0.5, 0.5]}
          fitView
          fitViewOptions={{ padding: 0.4, maxZoom: 1 }}
          minZoom={0.2}
          maxZoom={2}
          zoomOnDoubleClick={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1.5} color="#cbd5e1" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="hidden! md:block!" />
        </ReactFlow>

        {/* Empty canvas: offer a first topic node */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Button size="lg" onClick={addTopic}>
              <Plus className="h-5 w-5" />
              {t('editor.addTopic')}
            </Button>
          </div>
        )}

        {/* Floating toolbar for the selected node */}
        {selectedNode && !editing && (
          <div className="absolute bottom-4 left-1/2 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-0.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <span className="hidden px-2 text-xs font-medium text-slate-400 md:block">
              {t('editor.addChild')}
            </span>
            {quickAddKinds.map(({ kind, icon: Icon, iconClass }) => (
              <button
                key={kind}
                type="button"
                onClick={() => addChild(kind)}
                title={t('editor.addChild')}
                className="flex h-11 min-w-12 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <Icon className={cn('h-4 w-4', iconClass)} />
                {t(`kinds.${kind}`)}
              </button>
            ))}
            <div className="mx-1 h-7 w-px shrink-0 bg-slate-200" />
            <button
              type="button"
              onClick={() => openEditor(selectedNode)}
              aria-label={t('editor.editNode')}
              title={t('editor.editNode')}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => requestDeleteNode(selectedNode.id)}
              aria-label={t('editor.deleteNode')}
              title={t('editor.deleteNode')}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50 active:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </Card>

      {/* Edit-node dialog */}
      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={t('editor.editNode')}>
        {editing && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              applyEdit();
            }}
          >
            <div>
              <Label htmlFor="mindmap-node-label">{t('editor.labelLabel')}</Label>
              <Input
                id="mindmap-node-label"
                value={editing.label}
                onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                onFocus={(event) => event.target.select()}
                maxLength={200}
                autoFocus
                required
              />
            </div>
            <div>
              <Label htmlFor="mindmap-node-kind">{t('editor.kindLabel')}</Label>
              <Select
                id="mindmap-node-kind"
                value={editing.kind}
                onChange={(event) => setEditing({ ...editing, kind: event.target.value as NodeKind })}
              >
                {NODE_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {t(`kinds.${kind}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => requestDeleteNode(editing.id)}
              >
                <Trash2 className="h-4 w-4" />
                {t('editor.deleteNode')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('editor.apply')}</Button>
              </div>
            </div>
          </form>
        )}
      </Dialog>
      <ConfirmDialog
        open={pendingDeleteNodeId !== null}
        onClose={() => setPendingDeleteNodeId(null)}
        onConfirm={() => {
          if (!pendingDeleteNodeId) return;
          confirmDeleteNode(pendingDeleteNodeId);
        }}
        title={t('editor.deleteNode')}
        description={t('editor.deleteNodeConfirm')}
        confirmLabel={t('editor.deleteNode')}
        cancelLabel={t('cancel')}
      />
    </div>
  );
}

function SaveIndicator({
  state,
  t,
}: {
  state: SaveState;
  t: ReturnType<typeof useTranslations<'mindmaps'>>;
}) {
  const config: Record<SaveState, { icon: React.ReactNode; label: string; className: string }> = {
    saved: {
      icon: <Check className="h-3.5 w-3.5" />,
      label: t('saved'),
      className: 'text-emerald-600',
    },
    dirty: {
      icon: <span className="h-2 w-2 rounded-full bg-amber-400" />,
      label: t('unsaved'),
      className: 'text-slate-400',
    },
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: t('saving'),
      className: 'text-slate-500',
    },
    error: {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: t('saveError'),
      className: 'text-red-600',
    },
  };
  const { icon, label, className } = config[state];

  return (
    <span className={cn('flex shrink-0 items-center gap-1.5 px-1 text-xs font-medium', className)}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
