'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { updateItem, deleteItem } from '@/lib/actions/todos';
import type { FamilyMember, TodoItemData, TodoPriority } from './types';

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

interface ItemDialogProps {
  item: TodoItemData;
  members: FamilyMember[];
  onClose: () => void;
}

export function ItemDialog({ item, members, onClose }: ItemDialogProps) {
  const t = useTranslations('todos');
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [dueDate, setDueDate] = useState(item.dueDate ? format(item.dueDate, 'yyyy-MM-dd') : '');
  const [assigneeId, setAssigneeId] = useState(item.assignee?.id ?? '');
  const [priority, setPriority] = useState<TodoPriority>(item.priority);
  const [pending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || pending) return;
    startTransition(async () => {
      await updateItem(item.id, {
        title: trimmed,
        notes: notes.trim() || null,
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
        priority,
      });
      onClose();
    });
  };

  const handleDelete = () => {
    if (!confirm(t('itemDialog.deleteConfirm'))) return;
    startTransition(async () => {
      await deleteItem(item.id);
      onClose();
    });
  };

  return (
    <Dialog open onClose={onClose} title={t('itemDialog.title')}>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="item-title">{t('itemDialog.titleLabel')}</Label>
          <Input
            id="item-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div>
          <Label htmlFor="item-notes">{t('itemDialog.notes')}</Label>
          <Textarea
            id="item-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('itemDialog.notesPlaceholder')}
            maxLength={2000}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="item-due">{t('itemDialog.dueDate')}</Label>
            <Input
              id="item-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="item-priority">{t('itemDialog.priority')}</Label>
            <Select
              id="item-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {t(`priority.${p}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="item-assignee">{t('itemDialog.assignee')}</Label>
          <Select
            id="item-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">{t('itemDialog.unassigned')}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleDelete}
            disabled={pending}
            aria-label={t('itemDialog.delete')}
            className="shrink-0 px-4 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={pending || !title.trim()}>
            {t('itemDialog.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
