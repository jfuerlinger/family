'use client';

import { useFormatter, useTranslations } from 'next-intl';
import {
  eachDayOfInterval,
  format as formatDate,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { eventsOnDay, type CalendarEventData } from './event-utils';

interface MonthGridProps {
  monthStart: Date;
  gridStart: Date;
  gridEnd: Date;
  selectedDay: Date;
  events: CalendarEventData[];
}

export function MonthGrid({ monthStart, gridStart, gridEnd, selectedDay, events }: MonthGridProps) {
  const router = useRouter();
  const format = useFormatter();
  const t = useTranslations('calendar');

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const monthKey = formatDate(monthStart, 'yyyy-MM');

  const selectDay = (day: Date) => {
    router.replace(
      `/calendar?month=${monthKey}&day=${formatDate(day, 'yyyy-MM-dd')}`,
      { scroll: false },
    );
  };

  return (
    <Card className="overflow-hidden">
      {/* Weekday header (Mon–Sun, localized via next-intl) */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {days.slice(0, 7).map((day) => (
          <div
            key={day.toISOString()}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:text-xs"
          >
            {format.dateTime(day, { weekday: 'short' })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const inMonth = isSameMonth(day, monthStart);
          const today = isToday(day);
          const selected = isSameDay(day, selectedDay);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => selectDay(day)}
              aria-pressed={selected}
              aria-label={format.dateTime(day, { day: 'numeric', month: 'long', year: 'numeric' })}
              className={cn(
                'relative flex aspect-square flex-col items-center border-b border-r border-slate-100 p-1 transition-colors',
                'nth-[7n]:border-r-0 hover:bg-slate-50 active:bg-slate-100',
                'md:aspect-auto md:min-h-24 md:items-stretch md:p-1.5',
                selected && 'bg-primary-50/70 hover:bg-primary-50',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-sm md:h-6 md:w-6 md:text-[13px]',
                  inMonth ? 'text-slate-700' : 'text-slate-300',
                  today && 'bg-primary-600 font-semibold text-white',
                  selected && !today && 'font-semibold text-primary-700 ring-1 ring-primary-300',
                )}
              >
                {day.getDate()}
              </span>

              {/* Mobile: colored dots */}
              <span className="mt-1 flex items-center justify-center gap-0.5 md:hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={cn('h-1.5 w-1.5 rounded-full', !inMonth && 'opacity-40')}
                    style={{ backgroundColor: event.color }}
                  />
                ))}
              </span>

              {/* Desktop: truncated title chips */}
              <span className="mt-1 hidden w-full min-w-0 flex-col gap-0.5 md:flex">
                {dayEvents.slice(0, 2).map((event) => (
                  <span
                    key={event.id}
                    className={cn(
                      'block truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight',
                      !inMonth && 'opacity-40',
                    )}
                    style={{ backgroundColor: `${event.color}1f`, color: event.color }}
                  >
                    {event.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="px-1.5 text-left text-[10px] font-medium text-slate-400">
                    {t('moreEvents', { count: dayEvents.length - 2 })}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
