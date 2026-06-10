import { getTranslations, getFormatter } from 'next-intl/server';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format as formatDate,
  isSameMonth,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { requireFamilyUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { MonthGrid } from './month-grid';
import { DayAgenda } from './day-agenda';
import { eventsOnDay, type CalendarEventData } from './event-utils';

interface CalendarPageProps {
  searchParams: Promise<{ month?: string; day?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const user = await requireFamilyUser();
  const t = await getTranslations('calendar');
  const format = await getFormatter();
  const { month, day } = await searchParams;

  const today = new Date();

  // Visible month (?month=YYYY-MM, defaults to the current month).
  let monthDate = month ? parse(month, 'yyyy-MM', new Date()) : today;
  if (!isValid(monthDate)) monthDate = today;
  const monthStart = startOfMonth(monthDate);

  // Full grid range: weeks start on Monday, include leading/trailing days.
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });

  // Selected day (?day=YYYY-MM-DD): today in the current month, otherwise the 1st.
  let selectedDay = day ? parse(day, 'yyyy-MM-dd', new Date()) : null;
  if (selectedDay && !isValid(selectedDay)) selectedDay = null;
  if (!selectedDay) selectedDay = isSameMonth(today, monthStart) ? today : monthStart;
  selectedDay = startOfDay(selectedDay);

  const events: CalendarEventData[] = await prisma.calendarEvent.findMany({
    where: {
      familyId: user.familyId,
      start: { lte: endOfDay(gridEnd) },
      OR: [{ end: { gte: gridStart } }, { end: null, start: { gte: gridStart } }],
    },
    orderBy: [{ allDay: 'desc' }, { start: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      start: true,
      end: true,
      allDay: true,
      color: true,
    },
  });

  const prevMonth = formatDate(subMonths(monthStart, 1), 'yyyy-MM');
  const nextMonth = formatDate(addMonths(monthStart, 1), 'yyyy-MM');

  const navLinkClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100';

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 first-letter:uppercase md:text-2xl">
          {format.dateTime(monthStart, { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/calendar"
            className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
          >
            {t('today')}
          </Link>
          <Link
            href={{ pathname: '/calendar', query: { month: prevMonth } }}
            aria-label={t('previousMonth')}
            className={navLinkClass}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Link
            href={{ pathname: '/calendar', query: { month: nextMonth } }}
            aria-label={t('nextMonth')}
            className={navLinkClass}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <MonthGrid
        monthStart={monthStart}
        gridStart={gridStart}
        gridEnd={gridEnd}
        selectedDay={selectedDay}
        events={events}
      />

      <DayAgenda day={selectedDay} events={eventsOnDay(events, selectedDay)} />
    </div>
  );
}
