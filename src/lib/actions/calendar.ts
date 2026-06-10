'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { parse, isValid, startOfDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireFamilyUser } from '@/lib/session';

export type ActionResult = { ok: true } | { ok: false; error: string };

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  location: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.preprocess(emptyToUndefined, z.string().regex(/^\d{2}:\d{2}$/).optional()),
  endTime: z.preprocess(emptyToUndefined, z.string().regex(/^\d{2}:\d{2}$/).optional()),
  allDay: z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean()),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    allDay: formData.get('allDay'),
    color: formData.get('color'),
  });
}

/** Combines the "date" + "startTime"/"endTime" form fields into DateTime values. */
function combineDateTimes(
  data: z.infer<typeof eventSchema>,
): { start: Date; end: Date | null } | 'invalid' | 'invalidTimeRange' {
  const day = parse(data.date, 'yyyy-MM-dd', new Date());
  if (!isValid(day)) return 'invalid';

  if (data.allDay) {
    return { start: startOfDay(day), end: null };
  }

  const start = data.startTime
    ? parse(`${data.date} ${data.startTime}`, 'yyyy-MM-dd HH:mm', new Date())
    : startOfDay(day);
  const end = data.endTime
    ? parse(`${data.date} ${data.endTime}`, 'yyyy-MM-dd HH:mm', new Date())
    : null;
  if (!isValid(start) || (end && !isValid(end))) return 'invalid';
  if (end && end <= start) return 'invalidTimeRange';

  return { start, end };
}

async function revalidateCalendar() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/calendar`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const user = await requireFamilyUser();

  const parsed = parseEventForm(formData);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const dates = combineDateTimes(parsed.data);
  if (typeof dates === 'string') return { ok: false, error: dates };

  await prisma.calendarEvent.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      start: dates.start,
      end: dates.end,
      allDay: parsed.data.allDay,
      color: parsed.data.color,
      familyId: user.familyId,
      createdById: user.id,
    },
  });

  await revalidateCalendar();
  return { ok: true };
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const user = await requireFamilyUser();

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return { ok: false, error: 'invalid' };

  const parsed = parseEventForm(formData);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const dates = combineDateTimes(parsed.data);
  if (typeof dates === 'string') return { ok: false, error: dates };

  // Verify the event belongs to the user's family before updating.
  const existing = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { familyId: true },
  });
  if (!existing || existing.familyId !== user.familyId)
    return { ok: false, error: 'notFound' };

  await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      start: dates.start,
      end: dates.end,
      allDay: parsed.data.allDay,
      color: parsed.data.color,
    },
  });

  await revalidateCalendar();
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const user = await requireFamilyUser();
  if (typeof id !== 'string' || !id) return { ok: false, error: 'invalid' };

  // Verify the event belongs to the user's family before deleting.
  const existing = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { familyId: true },
  });
  if (!existing || existing.familyId !== user.familyId)
    return { ok: false, error: 'notFound' };

  await prisma.calendarEvent.delete({ where: { id } });

  await revalidateCalendar();
  return { ok: true };
}
