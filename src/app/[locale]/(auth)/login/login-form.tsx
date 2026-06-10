'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loginUser } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function LoginForm() {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState(loginUser, undefined);

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
