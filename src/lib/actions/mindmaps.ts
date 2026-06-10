'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireFamilyUser } from '@/lib/session';

const titleSchema = z.string().trim().min(1).max(120);
const descriptionSchema = z.string().trim().max(500);

/** Minimal structural validation — React Flow nodes/edges are stored as-is. */
const nodeSchema = z.looseObject({
  id: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.looseObject({ label: z.string() }),
});

const edgeSchema = z.looseObject({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
});

function coerceArray(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export async function createMindmap(input: { title: string; description?: string }) {
  const user = await requireFamilyUser();

  const title = titleSchema.safeParse(input.title);
  const description = descriptionSchema.optional().safeParse(input.description);
  if (!title.success || !description.success) return { ok: false as const };

  const rootNode = {
    id: 'root',
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: { label: title.data, kind: 'topic' },
  };

  const mindmap = await prisma.mindmap.create({
    data: {
      title: title.data,
      description: description.data || null,
      nodes: [rootNode] as unknown as Prisma.InputJsonValue,
      edges: [] as unknown as Prisma.InputJsonValue,
      familyId: user.familyId,
      createdById: user.id,
    },
  });

  const locale = await getLocale();
  revalidatePath(`/${locale}/mindmaps`);
  redirect(`/${locale}/mindmaps/${mindmap.id}`);
}

export async function renameMindmap(id: string, title: string, description?: string) {
  const user = await requireFamilyUser();

  const parsedTitle = titleSchema.safeParse(title);
  const parsedDescription = descriptionSchema.optional().safeParse(description);
  if (!parsedTitle.success || !parsedDescription.success) return { ok: false as const };

  const { count } = await prisma.mindmap.updateMany({
    where: { id, familyId: user.familyId },
    data: {
      title: parsedTitle.data,
      ...(description !== undefined ? { description: parsedDescription.data || null } : {}),
    },
  });
  if (count === 0) return { ok: false as const };

  const locale = await getLocale();
  revalidatePath(`/${locale}/mindmaps`);
  revalidatePath(`/${locale}/mindmaps/${id}`);
  return { ok: true as const };
}

export async function deleteMindmap(id: string) {
  const user = await requireFamilyUser();

  const { count } = await prisma.mindmap.deleteMany({
    where: { id, familyId: user.familyId },
  });
  if (count === 0) return { ok: false as const };

  const locale = await getLocale();
  revalidatePath(`/${locale}/mindmaps`);
  return { ok: true as const };
}

export async function saveMindmap(id: string, nodes: unknown, edges: unknown) {
  const user = await requireFamilyUser();

  const parsedNodes = z.array(nodeSchema).safeParse(coerceArray(nodes));
  const parsedEdges = z.array(edgeSchema).safeParse(coerceArray(edges));
  if (!parsedNodes.success || !parsedEdges.success) return { ok: false as const };

  const { count } = await prisma.mindmap.updateMany({
    where: { id, familyId: user.familyId },
    data: {
      nodes: parsedNodes.data as unknown as Prisma.InputJsonValue,
      edges: parsedEdges.data as unknown as Prisma.InputJsonValue,
    },
  });
  if (count === 0) return { ok: false as const };

  // Keep the overview (node counts, updated dates) fresh; the editor itself
  // holds its own client state, so we only revalidate the list.
  const locale = await getLocale();
  revalidatePath(`/${locale}/mindmaps`);
  return { ok: true as const };
}
