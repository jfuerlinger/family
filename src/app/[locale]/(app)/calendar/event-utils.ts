import { endOfDay, startOfDay } from 'date-fns';

/** Plain event shape shared between the server page and client components. */
export interface CalendarEventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start: Date;
  end: Date | null;
  allDay: boolean;
  color: string;
}

/** Preset swatch colors for the event dialog (matches the family palette). */
export const EVENT_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#84cc16',
] as const;

/** True when the event touches the given day (multi-day events count on every day). */
export function occursOnDay(event: CalendarEventData, day: Date): boolean {
  const eventEnd = event.end ?? event.start;
  return event.start <= endOfDay(day) && eventEnd >= startOfDay(day);
}

/** Events of a given day, all-day events first, then sorted by start time. */
export function eventsOnDay(events: CalendarEventData[], day: Date): CalendarEventData[] {
  return events
    .filter((event) => occursOnDay(event, day))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.start.getTime() - b.start.getTime();
    });
}
