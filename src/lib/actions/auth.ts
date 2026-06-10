'use server';

import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { signIn, signOut, auth } from '@/lib/auth';
import { MEMBER_COLORS } from '@/lib/utils';

export type AuthFormState = { error?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

export async function registerUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = await getLocale();
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.some((i) => i.path[0] === 'password');
    return { error: passwordIssue ? 'passwordTooShort' : 'invalidCredentials' };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'emailTaken' };

  const passwordHash = await bcrypt.hash(password, 12);
  const color = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
  await prisma.user.create({
    data: { name, email, passwordHash, locale, avatarColor: color },
  });

  await signIn('credentials', { email, password, redirect: false });
  redirect(`/${locale}/onboarding`);
}

export async function loginUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = await getLocale();
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: 'invalidCredentials' };
    throw error;
  }
  redirect(`/${locale}/dashboard`);
}

export async function logout() {
  await signOut({ redirect: false });
  const locale = await getLocale();
  redirect(`/${locale}/login`);
}

const createFamilySchema = z.object({ familyName: z.string().trim().min(1).max(100) });

export async function createFamily(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'invalidCredentials' };
  const parsed = createFamilySchema.safeParse({ familyName: formData.get('familyName') });
  if (!parsed.success) return { error: 'invalidCredentials' };

  await prisma.family.create({
    data: {
      name: parsed.data.familyName,
      members: { connect: { id: session.user.id } },
    },
  });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: 'ADMIN' },
  });

  const locale = await getLocale();
  revalidatePath(`/${locale}`, 'layout');
  redirect(`/${locale}/dashboard`);
}

export async function joinFamily(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'invalidCredentials' };
  const inviteCode = String(formData.get('inviteCode') ?? '').trim();
  if (!inviteCode) return { error: 'invalidInvite' };

  const family = await prisma.family.findUnique({ where: { inviteCode } });
  if (!family) return { error: 'invalidInvite' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { familyId: family.id, role: 'MEMBER' },
  });

  const locale = await getLocale();
  revalidatePath(`/${locale}`, 'layout');
  redirect(`/${locale}/dashboard`);
}
