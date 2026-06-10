import type { Edge } from '@xyflow/react';
import { redirect } from '@/i18n/navigation';
import { requireFamilyUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { MindmapEditor } from '../mindmap-editor';
import type { MindmapNode } from '../mindmap-node';

export default async function MindmapEditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await requireFamilyUser();

  const mindmap = await prisma.mindmap.findFirst({
    where: { id, familyId: user.familyId },
  });
  if (!mindmap) {
    return redirect({ href: '/mindmaps', locale });
  }

  const initialNodes = (Array.isArray(mindmap.nodes) ? mindmap.nodes : []) as unknown as MindmapNode[];
  const initialEdges = (Array.isArray(mindmap.edges) ? mindmap.edges : []) as unknown as Edge[];

  return (
    <MindmapEditor
      id={mindmap.id}
      title={mindmap.title}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
    />
  );
}
