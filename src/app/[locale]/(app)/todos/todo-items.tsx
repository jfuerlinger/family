'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { TodoItemRow } from './todo-item-row';
import { ItemDialog } from './item-dialog';
import type { FamilyMember, TodoItemData } from './types';

interface TodoItemsProps {
  openItems: TodoItemData[];
  completedItems: TodoItemData[];
  members: FamilyMember[];
}

export function TodoItems({ openItems, completedItems, members }: TodoItemsProps) {
  const t = useTranslations('todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const editingItem =
    [...openItems, ...completedItems].find((i) => i.id === editingId) ?? null;

  return (
    <div className="space-y-4">
      <Card>
        {openItems.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={completedItems.length > 0 ? t('items.allDoneTitle') : t('items.emptyTitle')}
            description={
              completedItems.length > 0
                ? t('items.allDoneDescription')
                : t('items.emptyDescription')
            }
          />
        ) : (
          <CardContent className="p-2 sm:p-3">
            <ul className="divide-y divide-slate-50">
              {openItems.map((item) => (
                <TodoItemRow key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {completedItems.length > 0 && (
        <Card>
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            aria-expanded={showCompleted}
            className="flex h-12 w-full items-center justify-between px-5 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            {t('items.completed', { count: completedItems.length })}
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showCompleted && 'rotate-180')}
            />
          </button>
          {showCompleted && (
            <CardContent className="border-t border-slate-100 p-2 sm:p-3">
              <ul className="divide-y divide-slate-50">
                {completedItems.map((item) => (
                  <TodoItemRow key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {editingItem && (
        <ItemDialog
          key={editingItem.id}
          item={editingItem}
          members={members}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
