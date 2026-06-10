import { getTranslations } from 'next-intl/server';
import { ListTodo, ChevronRight } from 'lucide-react';
import { requireFamilyUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { NewListDialog } from './new-list-dialog';

export default async function TodosPage() {
  const user = await requireFamilyUser();
  const t = await getTranslations('todos');

  const lists = await prisma.todoList.findMany({
    where: { familyId: user.familyId },
    orderBy: { createdAt: 'asc' },
    include: { items: { select: { done: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        {lists.length > 0 && <NewListDialog />}
      </div>

      {lists.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListTodo}
            title={t('lists.emptyTitle')}
            description={t('lists.emptyDescription')}
            action={<NewListDialog />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {lists.map((list) => {
            const total = list.items.length;
            const done = list.items.filter((i) => i.done).length;
            const open = total - done;
            const progress = total === 0 ? 0 : Math.round((done / total) * 100);

            return (
              <Link key={list.id} href={`/todos/${list.id}`} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-(--shadow-card-hover)">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${list.color}1a` }}
                      >
                        <ListTodo className="h-5 w-5" style={{ color: list.color }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-semibold text-slate-900">
                          {list.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {total === 0
                            ? t('lists.noItems')
                            : open === 0
                              ? t('lists.allDone')
                              : t('lists.openCount', { count: open })}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400" />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: list.color }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">
                        {t('lists.progress', { done, total })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
