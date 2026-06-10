'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LIST_COLORS } from './types';

interface ListFormProps {
  initialName?: string;
  initialColor?: string;
  submitLabel: string;
  onSubmit: (name: string, color: string) => Promise<void>;
}

/** Shared form (name + color swatches) for creating and editing lists. */
export function ListForm({
  initialName = '',
  initialColor = LIST_COLORS[0],
  submitLabel,
  onSubmit,
}: ListFormProps) {
  const t = useTranslations('todos');
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<string>(initialColor);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || pending) return;
        startTransition(() => onSubmit(trimmed, color));
      }}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="list-name">{t('listDialog.name')}</Label>
        <Input
          id="list-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('listDialog.namePlaceholder')}
          maxLength={100}
          autoFocus
          required
        />
      </div>

      <div>
        <Label>{t('listDialog.color')}</Label>
        <div className="flex flex-wrap gap-2.5">
          {LIST_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              aria-label={preset}
              aria-pressed={color === preset}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-transform',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                color === preset ? 'scale-110 ring-2 ring-slate-300 ring-offset-2' : 'hover:scale-105',
              )}
              style={{ backgroundColor: preset }}
            >
              {color === preset && <Check className="h-5 w-5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending || !name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
