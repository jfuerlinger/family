import { getTranslations, getFormatter } from 'next-intl/server';
import { ListTodo, CalendarDays, Workflow, AlertCircle } from 'lucide-react';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { requireFamilyUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  const user = await requireFamilyUser();
  const t = await getTranslations('dashboard');
  const format = await getFormatter();

  const now = new Date();
  const [openTodos, todayEventCount, upcomingEvents, mindmapCount] = await Promise.all([
    prisma.todoItem.findMany({
      where: { list: { familyId: user.familyId }, done: false },
      include: { assignee: true, list: true },
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: 6,
    }),
    prisma.calendarEvent.count({
      where: {
        familyId: user.familyId,
        start: { gte: startOfDay(now), lte: endOfDay(now) },
      },
    }),
    prisma.calendarEvent.findMany({
      where: { familyId: user.familyId, start: { gte: startOfDay(now), lte: addDays(now, 14) } },
      orderBy: { start: 'asc' },
      take: 5,
    }),
    prisma.mindmap.count({ where: { familyId: user.familyId } }),
  ]);

  const openTodoCount = await prisma.todoItem.count({
    where: { list: { familyId: user.familyId }, done: false },
  });

  const stats = [
    { label: t('openTodos'), value: openTodoCount, icon: ListTodo, href: '/todos' },
    { label: t('todayEvents'), value: todayEventCount, icon: CalendarDays, href: '/calendar' },
    { label: t('mindmaps'), value: mindmapCount, icon: Workflow, href: '/mindmaps' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('greeting', { name: user.name.split(' ')[0] })}
        </h1>
        <p className="text-sm text-slate-500">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={href} href={href}>
            <Card className="transition-shadow hover:shadow-(--shadow-card-hover)">
              <CardContent className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('openTodos')}</CardTitle>
            <Link href="/todos" className="text-sm font-medium text-primary-600 hover:underline">
              {t('viewAll')}
            </Link>
          </CardHeader>
          <CardContent>
            {openTodos.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{t('noTodos')}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {openTodos.map((todo) => {
                  const overdue = todo.dueDate && todo.dueDate < startOfDay(now);
                  const dueToday =
                    todo.dueDate &&
                    todo.dueDate >= startOfDay(now) &&
                    todo.dueDate <= endOfDay(now);
                  return (
                    <li key={todo.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: todo.list.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                        {todo.title}
                      </span>
                      {overdue && (
                        <Badge tone="danger">
                          <AlertCircle className="h-3 w-3" />
                          {t('overdue')}
                        </Badge>
                      )}
                      {dueToday && <Badge tone="warning">{t('dueToday')}</Badge>}
                      {todo.assignee && (
                        <Avatar
                          name={todo.assignee.name}
                          color={todo.assignee.avatarColor}
                          size="sm"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingEvents')}</CardTitle>
            <Link href="/calendar" className="text-sm font-medium text-primary-600 hover:underline">
              {t('viewAll')}
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{t('noEvents')}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className="h-9 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {event.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format.dateTime(event.start, {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          ...(event.allDay ? {} : { hour: 'numeric', minute: '2-digit' }),
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
