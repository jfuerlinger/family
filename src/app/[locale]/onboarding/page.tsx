import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Users } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { OnboardingForms } from './onboarding-forms';

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.familyId) redirect('/dashboard');
  const t = await getTranslations('onboarding');

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-white px-4 py-10 pt-safe pb-safe">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/25">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-500">{t('subtitle')}</p>
        </div>
      </div>
      <OnboardingForms />
    </main>
  );
}
