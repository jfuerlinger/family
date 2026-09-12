'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const NATIVE_LABELS: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  function switchTo(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label={t('language')}
      className="mb-6 flex rounded-xl border border-slate-200/80 bg-white/70 p-1 backdrop-blur-sm"
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => switchTo(code)}
            className={cn(
              'min-w-[5.5rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-500/10 hover:text-slate-900',
            )}
          >
            {NATIVE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
