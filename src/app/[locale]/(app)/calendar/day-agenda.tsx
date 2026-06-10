'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { EventDialog } from './event-dialog';
import type { CalendarEventData } from './event-utils';

interface DayAgendaProps {
  day: Date;
  events: CalendarEventData[];
}

export function DayAgenda({ day, events }: DayAgendaProps) {
  const t = useTranslations('calendar');
  const format = useFormatter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventData | null>(null);

  const openCreate = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEventData) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const timeLabel = (event: CalendarEventData) => {
    const start = format.dateTime(event.start, { hour: 'numeric', minute: '2-digit' });
    if (!event.end) return start;
    return `${start} – ${format.dateTime(event.end, { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="first-letter:uppercase">
            {format.dateTime(day, { weekday: 'long', day: 'numeric', month: 'long' })}
          </CardTitle>
          <Button size="sm" onClick={openCreate} className="hidden md:inline-flex">
            <Plus className="h-4 w-4" />
            {t('newEvent')}
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={t('noEvents')}
              description={t('noEventsHint')}
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {events.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span
                      className="h-10 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="w-24 shrink-0 text-xs text-slate-500 md:w-32 md:text-sm">
                      {event.allDay ? <Badge tone="primary">{t('allDay')}</Badge> : timeLabel(event)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {event.title}
                      </span>
                      {event.location && (
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Floating action button (mobile, above bottom nav) */}
      <button
        type="button"
        onClick={openCreate}
        aria-label={t('newEvent')}
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 active:bg-primary-800 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {dialogOpen && (
        <EventDialog
          open
          onClose={() => setDialogOpen(false)}
          event={editingEvent}
          defaultDate={day}
        />
      )}
    </>
  );
}
