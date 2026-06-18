'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loginUser, loginWithTestUserShortcut } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type LoginFormProps = {
  enableTestLoginShortcut: boolean;
};

export function LoginForm({ enableTestLoginShortcut }: LoginFormProps) {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState(loginUser, undefined);
  const [shortcutState, shortcutAction, shortcutPending] = useActionState(
    loginWithTestUserShortcut,
    undefined,
  );

  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold text-slate-900">{t('loginTitle')}</h2>
        <p className="mb-6 text-sm text-slate-500">{t('loginSubtitle')}</p>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600">{t(state.error)}</p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {t('login')}
          </Button>
        </form>
        {enableTestLoginShortcut && (
          <form action={shortcutAction} className="mt-3">
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={shortcutPending}
            >
              {t('loginWithTestUser')}
            </Button>
          </form>
        )}
        {shortcutState?.error && <p className="mt-2 text-sm text-red-600">{t(shortcutState.error)}</p>}
        <p className="mt-5 text-center text-sm text-slate-500">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:underline">
            {t('register')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
