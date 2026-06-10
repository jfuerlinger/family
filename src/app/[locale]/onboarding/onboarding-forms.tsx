'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { createFamily, joinFamily } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function OnboardingForms() {
  const t = useTranslations('onboarding');
  const tAuth = useTranslations('auth');
  const [createState, createAction, createPending] = useActionState(createFamily, undefined);
  const [joinState, joinAction, joinPending] = useActionState(joinFamily, undefined);

  return (
    <div className="w-full max-w-sm space-y-4">
      <Card>
        <CardContent>
          <h2 className="mb-4 text-base font-semibold text-slate-900">{t('createFamily')}</h2>
          <form action={createAction} className="space-y-4">
            <div>
              <Label htmlFor="familyName">{t('familyName')}</Label>
              <Input
                id="familyName"
                name="familyName"
                placeholder={t('familyNamePlaceholder')}
                required
              />
            </div>
            {createState?.error && (
              <p className="text-sm text-red-600">{tAuth(createState.error)}</p>
            )}
            <Button type="submit" className="w-full" disabled={createPending}>
              {t('createFamily')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t('or')}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-4 text-base font-semibold text-slate-900">{t('joinFamily')}</h2>
          <form action={joinAction} className="space-y-4">
            <div>
              <Label htmlFor="inviteCode">{t('inviteCode')}</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder={t('inviteCodePlaceholder')}
                required
              />
            </div>
            {joinState?.error && <p className="text-sm text-red-600">{tAuth(joinState.error)}</p>}
            <Button type="submit" variant="outline" className="w-full" disabled={joinPending}>
              {t('joinFamily')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
