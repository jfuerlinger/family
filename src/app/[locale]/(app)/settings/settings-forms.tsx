'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { updateProfile } from '@/lib/actions/settings';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';

export function ProfileForm({ name, locale }: { name: string; locale: string }) {
  const t = useTranslations('settings');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await updateProfile(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        })
      }
      className="max-w-md space-y-4"
    >
      <div>
        <Label htmlFor="name">{tAuth('name')}</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div>
        <Label htmlFor="locale">{t('language')}</Label>
        <Select id="locale" name="locale" defaultValue={locale}>
          <option value="de">{t('german')}</option>
          <option value="en">{t('english')}</option>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {saved ? t('saved') : tCommon('save')}
      </Button>
    </form>
  );
}

export function InviteCode({ code }: { code: string }) {
  const t = useTranslations('settings');
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex max-w-md items-center gap-2">
      <code className="flex-1 truncate rounded-xl bg-slate-100 px-3.5 py-2.5 font-mono text-sm text-slate-700">
        {code}
      </code>
      <Button
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        {copied ? t('copied') : t('copy')}
      </Button>
    </div>
  );
}
