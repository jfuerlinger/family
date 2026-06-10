'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { routing } from '@/i18n/routing';

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  locale: z.enum(routing.locales),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    locale: formData.get('locale'),
  });
  if (!parsed.success) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, locale: parsed.data.locale },
  });

  const currentLocale = await getLocale();
  if (parsed.data.locale !== currentLocale) {
    redirect(`/${parsed.data.locale}/settings`);
  }
  revalidatePath(`/${currentLocale}`, 'layout');
}
