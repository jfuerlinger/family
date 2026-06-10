import { Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('app');
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-white px-4 py-10 pt-safe pb-safe">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/25">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('name')}</h1>
          <p className="text-sm text-slate-500">{t('tagline')}</p>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
