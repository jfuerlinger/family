import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  redirect(session?.user ? `/${locale}/dashboard` : `/${locale}/login`);
}
