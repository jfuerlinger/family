import { getLocale, getTranslations } from 'next-intl/server';
import { requireFamilyUser } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileForm, InviteCode } from './settings-forms';

export default async function SettingsPage() {
  const user = await requireFamilyUser();
  const t = await getTranslations('settings');
  const locale = await getLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} locale={locale} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('family')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-1.5 text-sm font-medium text-slate-700">{t('inviteCode')}</div>
            <InviteCode code={user.family.inviteCode} />
            <p className="mt-2 text-xs text-slate-500">{t('inviteHint')}</p>
          </div>
          <div>
            <div className="mb-3 text-sm font-medium text-slate-700">{t('membersTitle')}</div>
            <ul className="space-y-2.5">
              {user.family.members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <Avatar name={member.name} color={member.avatarColor} size="md" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {member.name}
                  </span>
                  <Badge tone={member.role === 'ADMIN' ? 'primary' : 'default'}>
                    {member.role === 'ADMIN' ? t('admin') : t('member')}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
