'use client';

import { useOptimistic, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { isToday, startOfDay } from 'date-fns';
import { CalendarDays, Check, Flag } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toggleItem } from '@/lib/actions/todos';
import type { TodoItemData } from './types';

interface TodoItemRowProps {
  item: TodoItemData;
  onEdit: () => void;
}

export function TodoItemRow({ item, onEdit }: TodoItemRowProps) {
  const t = useTranslations('todos');
  const format = useFormatter();
  const [, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useOptimistic(item.done);

  const overdue = !optimisticDone && item.dueDate && item.dueDate < startOfDay(new Date());
  const dueToday = !optimisticDone && item.dueDate && isToday(item.dueDate);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      await toggleItem(item.id);
    });
  };

  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={optimisticDone}
        aria-label={optimisticDone ? t('items.markOpen') : t('items.markDone')}
        onClick={handleToggle}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-slate-50"
      >
        <span
          className={cn(
            'flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 transition-colors',
            optimisticDone
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-slate-300 bg-white',
          )}
        >
          {optimisticDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-medium',
              optimisticDone ? 'text-slate-400 line-through' : 'text-slate-800',
            )}
          >
            {item.title}
          </span>
          {item.notes && (
            <span className="block truncate text-xs text-slate-400">{item.notes}</span>
          )}
        </span>

        {item.priority === 'HIGH' && (
          <Flag
            className="h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500"
            aria-label={t('priority.HIGH')}
          />
        )}
        {item.priority === 'LOW' && (
          <Flag
            className="h-3.5 w-3.5 shrink-0 text-slate-300"
            aria-label={t('priority.LOW')}
          />
        )}

        {item.dueDate && (
          <Badge tone={overdue ? 'danger' : dueToday ? 'warning' : 'default'} className="shrink-0">
            <CalendarDays className="h-3 w-3" />
            {dueToday
              ? t('items.today')
              : format.dateTime(item.dueDate, { day: 'numeric', month: 'short' })}
          </Badge>
        )}

        {item.assignee && (
          <Avatar name={item.assignee.name} color={item.assignee.avatarColor} size="sm" />
        )}
      </button>
    </li>
  );
}
