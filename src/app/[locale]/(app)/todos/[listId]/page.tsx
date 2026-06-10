import { notFound } from 'next/navigation';
import { requireFamilyUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ListHeader } from '../list-header';
import { QuickAdd } from '../quick-add';
import { TodoItems } from '../todo-items';
import type { TodoItemData } from '../types';

export default async function TodoListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  const user = await requireFamilyUser();

  const list = await prisma.todoList.findFirst({
    where: { id: listId, familyId: user.familyId },
    include: {
      items: {
        include: { assignee: { select: { id: true, name: true, avatarColor: true } } },
        orderBy: [
          { done: 'asc' },
          { dueDate: { sort: 'asc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
      },
    },
  });
  if (!list) notFound();

  const toItemData = (item: (typeof list.items)[number]): TodoItemData => ({
    id: item.id,
    title: item.title,
    notes: item.notes,
    done: item.done,
    priority: item.priority,
    dueDate: item.dueDate,
    assignee: item.assignee,
  });

  const openItems = list.items.filter((i) => !i.done).map(toItemData);
  const completedItems = list.items
    .filter((i) => i.done)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))
    .map(toItemData);

  const members = user.family.members.map((m) => ({
    id: m.id,
    name: m.name,
    avatarColor: m.avatarColor,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <ListHeader
        list={{ id: list.id, name: list.name, color: list.color }}
        openCount={openItems.length}
      />
      <QuickAdd listId={list.id} />
      <TodoItems openItems={openItems} completedItems={completedItems} members={members} />
    </div>
  );
}
