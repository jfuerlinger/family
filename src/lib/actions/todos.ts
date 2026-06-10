'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolves the caller's familyId or null when unauthenticated / no family. */
async function getCallerFamilyId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  });
  return user?.familyId ?? null;
}

async function revalidateTodos(listId?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/todos`);
  if (listId) revalidatePath(`/${locale}/todos/${listId}`);
  revalidatePath(`/${locale}/dashboard`);
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const nameSchema = z.string().trim().min(1).max(100);
const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
// Date-only string coming from <input type="date">.
const dueDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullish();

const itemDataSchema = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(2000).nullish(),
  dueDate: dueDateSchema,
  assigneeId: z.string().nullish(),
  priority: prioritySchema.default('MEDIUM'),
});

export type TodoItemInput = z.input<typeof itemDataSchema>;

function parseDueDate(value: string | null | undefined): Date | null {
  // Anchor at noon to keep the calendar day stable across timezones.
  return value ? new Date(`${value}T12:00:00`) : null;
}

/** Returns the assigneeId when it is a member of the family, otherwise null. */
async function validAssigneeId(
  assigneeId: string | null | undefined,
  familyId: string,
): Promise<string | null> {
  if (!assigneeId) return null;
  const member = await prisma.user.findFirst({
    where: { id: assigneeId, familyId },
    select: { id: true },
  });
  return member?.id ?? null;
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export async function createList(name: string, color: string) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const parsed = z.object({ name: nameSchema, color: colorSchema }).safeParse({ name, color });
  if (!parsed.success) return;

  await prisma.todoList.create({
    data: { name: parsed.data.name, color: parsed.data.color, familyId },
  });
  await revalidateTodos();
}

export async function updateList(id: string, data: { name?: string; color?: string }) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const parsed = z
    .object({ name: nameSchema.optional(), color: colorSchema.optional() })
    .safeParse(data);
  if (!parsed.success) return;

  const list = await prisma.todoList.findFirst({ where: { id, familyId }, select: { id: true } });
  if (!list) return;

  await prisma.todoList.update({ where: { id }, data: parsed.data });
  await revalidateTodos(id);
}

export async function deleteList(id: string) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const list = await prisma.todoList.findFirst({ where: { id, familyId }, select: { id: true } });
  if (!list) return;

  await prisma.todoList.delete({ where: { id } });
  await revalidateTodos(id);
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

export async function createItem(listId: string, data: TodoItemInput) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const list = await prisma.todoList.findFirst({
    where: { id: listId, familyId },
    select: { id: true },
  });
  if (!list) return;

  const parsed = itemDataSchema.safeParse(data);
  if (!parsed.success) return;

  await prisma.todoItem.create({
    data: {
      listId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      dueDate: parseDueDate(parsed.data.dueDate),
      assigneeId: await validAssigneeId(parsed.data.assigneeId, familyId),
      priority: parsed.data.priority,
    },
  });
  await revalidateTodos(listId);
}

export async function toggleItem(id: string) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const item = await prisma.todoItem.findFirst({
    where: { id, list: { familyId } },
    select: { id: true, done: true, listId: true },
  });
  if (!item) return;

  await prisma.todoItem.update({
    where: { id },
    data: { done: !item.done, completedAt: item.done ? null : new Date() },
  });
  await revalidateTodos(item.listId);
}

export async function updateItem(id: string, data: TodoItemInput) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const item = await prisma.todoItem.findFirst({
    where: { id, list: { familyId } },
    select: { id: true, listId: true },
  });
  if (!item) return;

  const parsed = itemDataSchema.safeParse(data);
  if (!parsed.success) return;

  await prisma.todoItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      dueDate: parseDueDate(parsed.data.dueDate),
      assigneeId: await validAssigneeId(parsed.data.assigneeId, familyId),
      priority: parsed.data.priority,
    },
  });
  await revalidateTodos(item.listId);
}

export async function deleteItem(id: string) {
  const familyId = await getCallerFamilyId();
  if (!familyId) return;

  const item = await prisma.todoItem.findFirst({
    where: { id, list: { familyId } },
    select: { id: true, listId: true },
  });
  if (!item) return;

  await prisma.todoItem.delete({ where: { id } });
  await revalidateTodos(item.listId);
}
