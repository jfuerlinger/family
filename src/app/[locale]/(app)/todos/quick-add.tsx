'use client';

import { useRef, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createItem } from '@/lib/actions/todos';

export function QuickAdd({ listId }: { listId: string }) {
  const t = useTranslations('todos');
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const title = inputRef.current?.value.trim();
        if (!title) return;
        if (inputRef.current) inputRef.current.value = '';
        startTransition(() => createItem(listId, { title }));
      }}
      className="flex gap-2"
    >
      <Input
        ref={inputRef}
        name="title"
        placeholder={t('items.quickAddPlaceholder')}
        maxLength={200}
        autoComplete="off"
        className="h-12"
        required
      />
      <Button type="submit" size="lg" className="shrink-0 px-4" disabled={pending} aria-label={t('items.add')}>
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">{t('items.add')}</span>
      </Button>
    </form>
  );
}
