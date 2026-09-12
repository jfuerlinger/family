import { describe, expect, it } from 'vitest';
import { persistUserLocaleByEmail, type UserLocaleWriter } from './persist-user-locale';

function memoryUsers(initial: Record<string, string> = {}) {
  const locales = new Map(Object.entries(initial));
  const users: UserLocaleWriter = {
    async updateMany({ where, data }) {
      locales.set(where.email, data.locale);
      return { count: 1 };
    },
  };
  return { locales, users };
}

describe('persistUserLocaleByEmail', () => {
  it('writes the locale for the given email', async () => {
    const { locales, users } = memoryUsers({ 'anna@example.com': 'de' });

    await persistUserLocaleByEmail('anna@example.com', 'en', users);

    expect(locales.get('anna@example.com')).toBe('en');
  });

  it('does nothing when email is empty', async () => {
    const { locales, users } = memoryUsers({ 'anna@example.com': 'de' });

    await persistUserLocaleByEmail('', 'en', users);

    expect(locales.get('anna@example.com')).toBe('de');
    expect(locales.size).toBe(1);
  });
});
