import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import de from '../../../messages/de/common.json';
import en from '../../../messages/en/common.json';
import { LocaleSwitcher } from './locale-switcher';

const { replace } = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/login',
  useRouter: () => ({ replace }),
}));

function renderSwitcher(locale: 'de' | 'en') {
  const messages = locale === 'de' ? de : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  );
}

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('marks the active locale and keeps native language names', () => {
    renderSwitcher('de');

    expect(screen.getByRole('group', { name: 'Sprache' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Deutsch', pressed: true })).toBeDefined();
    expect(screen.getByRole('button', { name: 'English', pressed: false })).toBeDefined();
  });

  it('navigates to the same path in the other locale', async () => {
    const user = userEvent.setup();
    renderSwitcher('de');

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(replace).toHaveBeenCalledWith('/login', { locale: 'en' });
  });

  it('does not navigate when the active locale is clicked', async () => {
    const user = userEvent.setup();
    renderSwitcher('en');

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(replace).not.toHaveBeenCalled();
  });
});
