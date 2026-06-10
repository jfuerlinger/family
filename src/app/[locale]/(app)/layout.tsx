import { requireFamilyUser } from '@/lib/session';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireFamilyUser();

  return (
    <AppShell
      user={{ name: user.name, color: user.avatarColor }}
      familyName={user.family.name}
    >
      {children}
    </AppShell>
  );
}
