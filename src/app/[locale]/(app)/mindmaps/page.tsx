import { getFormatter, getTranslations } from 'next-intl/server';
import { Workflow } from 'lucide-react';
import { requireFamilyUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { NewMindmapDialog } from './new-mindmap-dialog';
import { MindmapCardActions } from './mindmap-card-actions';

export default async function MindmapsPage() {
  const user = await requireFamilyUser();
  const t = await getTranslations('mindmaps');
  const format = await getFormatter();

  const mindmaps = await prisma.mindmap.findMany({
    where: { familyId: user.familyId },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        <NewMindmapDialog />
      </div>

      {mindmaps.length === 0 ? (
        <Card>
          <EmptyState
            icon={Workflow}
            title={t('empty.title')}
            description={t('empty.description')}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mindmaps.map((mindmap) => {
            const nodeCount = Array.isArray(mindmap.nodes) ? mindmap.nodes.length : 0;
            return (
              <Card
                key={mindmap.id}
                className="relative transition-shadow hover:shadow-(--shadow-card-hover)"
              >
                <Link href={`/mindmaps/${mindmap.id}`} className="block p-5">
                  <h3 className="pr-16 text-base font-semibold text-slate-900">{mindmap.title}</h3>
                  {mindmap.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {mindmap.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge tone="primary">{t('nodeCount', { count: nodeCount })}</Badge>
                    <span>{t('updated', { time: format.relativeTime(mindmap.updatedAt) })}</span>
                  </div>
                </Link>
                <div className="absolute right-3 top-3">
                  <MindmapCardActions
                    id={mindmap.id}
                    title={mindmap.title}
                    description={mindmap.description}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
