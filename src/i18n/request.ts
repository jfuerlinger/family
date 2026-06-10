import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// Messages are split per feature so modules can be translated independently.
const NAMESPACE_FILES = ['common', 'todos', 'calendar', 'mindmaps'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const parts = await Promise.all(
    NAMESPACE_FILES.map(
      async (name) => (await import(`../../messages/${locale}/${name}.json`)).default,
    ),
  );

  return { locale, messages: Object.assign({}, ...parts) };
});
