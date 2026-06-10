'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Workflow,
  Settings,
  LogOut,
  Users,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { logout } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/todos', key: 'todos', icon: ListTodo },
  { href: '/calendar', key: 'calendar', icon: CalendarDays },
  { href: '/mindmaps', key: 'mindmaps', icon: Workflow },
  { href: '/settings', key: 'settings', icon: Settings },
] as const;

interface AppShellProps {
  user: { name: string; color: string };
  familyName: string;
  children: React.ReactNode;
}

export function AppShell({ user, familyName, children }: AppShellProps) {
  const t = useTranslations('nav');
  const tApp = useTranslations('app');
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex flex-1">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/70 bg-white md:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{tApp('name')}</div>
            <div className="truncate text-xs text-slate-500">{familyName}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="h-5 w-5" />
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <Avatar name={user.name} color={user.color} size="md" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
              {user.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3 pt-safe backdrop-blur md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">{familyName}</span>
        </div>
        <Avatar name={user.name} color={user.color} size="md" />
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pt-[4.25rem] pb-24 md:ml-64 md:px-8 md:pt-8 md:pb-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200/70 bg-white/95 pb-safe backdrop-blur md:hidden">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium',
              isActive(href) ? 'text-primary-600' : 'text-slate-400',
            )}
          >
            <Icon className="h-5 w-5" />
            {t(key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
