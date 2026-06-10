'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { format as formatDate } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createEvent, updateEvent, deleteEvent } from '@/lib/actions/calendar';
import { EVENT_COLORS, type CalendarEventData } from './event-utils';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  /** When set the dialog edits this event, otherwise it creates a new one. */
  event: CalendarEventData | null;
  /** Pre-filled date for new events (the selected day). */
  defaultDate: Date;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
      {label}
    </Button>
  );
}

export function EventDialog({ open, onClose, event, defaultDate }: EventDialogProps) {
  const t = useTranslations('calendar');
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [color, setColor] = useState(event?.color ?? EVENT_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const isEdit = event !== null;

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const result = isEdit ? await updateEvent(formData) : await createEvent(formData);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleDelete = () => {
    if (!event) return;
    if (!confirm(t('confirmDelete'))) return;
    setError(null);
    startDelete(async () => {
      const result = await deleteEvent(event.id);
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? t('editEvent') : t('newEvent')}>
      <form action={handleSubmit} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={event.id} />}
        <input type="hidden" name="color" value={color} />

        <div>
          <Label htmlFor="event-title">{t('fields.title')}</Label>
          <Input
            id="event-title"
            name="title"
            required
            maxLength={200}
            autoFocus
            defaultValue={event?.title ?? ''}
            placeholder={t('fields.titlePlaceholder')}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-primary-600"
          />
          {t('allDay')}
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className={cn(allDay && 'col-span-2 sm:col-span-3')}>
            <Label htmlFor="event-date">{t('fields.date')}</Label>
            <Input
              id="event-date"
              type="date"
              name="date"
              required
              defaultValue={formatDate(event?.start ?? defaultDate, 'yyyy-MM-dd')}
            />
          </div>
          {!allDay && (
            <>
              <div>
                <Label htmlFor="event-start">{t('fields.startTime')}</Label>
                <Input
                  id="event-start"
                  type="time"
                  name="startTime"
                  required
                  defaultValue={
                    event && !event.allDay ? formatDate(event.start, 'HH:mm') : '12:00'
                  }
                />
              </div>
              <div>
                <Label htmlFor="event-end">{t('fields.endTime')}</Label>
                <Input
                  id="event-end"
                  type="time"
                  name="endTime"
                  defaultValue={
                    event?.end && !event.allDay ? formatDate(event.end, 'HH:mm') : ''
                  }
                />
              </div>
            </>
          )}
        </div>

        <div>
          <Label htmlFor="event-location">{t('fields.location')}</Label>
          <Input
            id="event-location"
            name="location"
            maxLength={200}
            defaultValue={event?.location ?? ''}
            placeholder={t('fields.locationPlaceholder')}
          />
        </div>

        <div>
          <Label htmlFor="event-description">{t('fields.description')}</Label>
          <Textarea
            id="event-description"
            name="description"
            maxLength={2000}
            defaultValue={event?.description ?? ''}
            placeholder={t('fields.descriptionPlaceholder')}
          />
        </div>

        <div>
          <Label>{t('fields.color')}</Label>
          <div className="flex flex-wrap gap-2">
            {EVENT_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={preset}
                aria-pressed={color === preset}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-transform',
                  color === preset
                    ? 'scale-110 ring-2 ring-offset-2 ring-slate-400'
                    : 'hover:scale-105',
                )}
                style={{ backgroundColor: preset }}
              >
                {color === preset && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {t(`errors.${error}`)}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              {t('delete')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} className="ml-auto">
            {t('cancel')}
          </Button>
          <SubmitButton label={t('save')} />
        </div>
      </form>
    </Dialog>
  );
}
