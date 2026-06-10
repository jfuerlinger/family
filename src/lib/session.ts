import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { family: { include: { members: { orderBy: { createdAt: 'asc' } } } } },
  });
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Redirects to /login when not authenticated. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/** Redirects to /onboarding when the user has not joined a family yet. */
export async function requireFamilyUser() {
  const user = await requireUser();
  if (!user.familyId || !user.family) redirect('/onboarding');
  return user as CurrentUser & { familyId: string; family: NonNullable<CurrentUser['family']> };
}
