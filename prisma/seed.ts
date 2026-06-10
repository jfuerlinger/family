import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function at(date: Date, hours: number, minutes = 0): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Idempotent-ish seed: reuse the demo family if it already exists.
  let family = await prisma.family.findFirst({ where: { name: 'Familie Muster' } });
  if (family) {
    console.log('Demo family already exists, resetting demo data...');
    await prisma.family.delete({ where: { id: family.id } });
  }

  family = await prisma.family.create({
    data: { name: 'Familie Muster' },
  });

  const anna = await prisma.user.upsert({
    where: { email: 'anna@example.com' },
    update: { familyId: family.id, role: 'ADMIN', passwordHash },
    create: {
      email: 'anna@example.com',
      name: 'Anna Muster',
      passwordHash,
      role: 'ADMIN',
      avatarColor: '#ec4899',
      familyId: family.id,
    },
  });

  const max = await prisma.user.upsert({
    where: { email: 'max@example.com' },
    update: { familyId: family.id, role: 'MEMBER', passwordHash },
    create: {
      email: 'max@example.com',
      name: 'Max Muster',
      passwordHash,
      role: 'MEMBER',
      avatarColor: '#0ea5e9',
      familyId: family.id,
    },
  });

  await prisma.todoList.create({
    data: {
      name: 'Haushalt',
      color: '#10b981',
      familyId: family.id,
      items: {
        create: [
          {
            title: 'Wocheneinkauf erledigen',
            notes: 'Milch, Brot, Obst und Gemüse nicht vergessen',
            priority: 'HIGH',
            dueDate: at(addDays(new Date(), 1), 18),
            assigneeId: max.id,
          },
          {
            title: 'Badezimmer putzen',
            priority: 'MEDIUM',
            assigneeId: anna.id,
          },
          {
            title: 'Altglas wegbringen',
            priority: 'LOW',
            done: true,
            completedAt: new Date(),
            assigneeId: max.id,
          },
        ],
      },
    },
  });

  const today = new Date();
  await prisma.calendarEvent.createMany({
    data: [
      {
        title: 'Familienabendessen',
        description: 'Gemeinsames Abendessen mit allen',
        location: 'Zuhause',
        start: at(today, 18, 30),
        end: at(today, 20, 0),
        color: '#f59e0b',
        familyId: family.id,
        createdById: anna.id,
      },
      {
        title: 'Zahnarzttermin Max',
        location: 'Praxis Dr. Huber',
        start: at(addDays(today, 3), 9, 0),
        end: at(addDays(today, 3), 9, 45),
        color: '#0ea5e9',
        familyId: family.id,
        createdById: max.id,
      },
    ],
  });

  // React Flow mindmap: root topic with two ideas, each idea with a pro/con.
  const nodes = [
    { id: 'root', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Urlaubsplanung', kind: 'topic' } },
    { id: 'idea-1', type: 'mindmap', position: { x: -260, y: 140 }, data: { label: 'Strandurlaub Italien', kind: 'idea' } },
    { id: 'idea-2', type: 'mindmap', position: { x: 260, y: 140 }, data: { label: 'Wandern in Tirol', kind: 'idea' } },
    { id: 'pro-1', type: 'mindmap', position: { x: -380, y: 280 }, data: { label: 'Sonne & Meer für die Kinder', kind: 'pro' } },
    { id: 'con-1', type: 'mindmap', position: { x: -140, y: 280 }, data: { label: 'Lange Anreise mit dem Auto', kind: 'con' } },
    { id: 'pro-2', type: 'mindmap', position: { x: 140, y: 280 }, data: { label: 'Günstig und naturnah', kind: 'pro' } },
    { id: 'con-2', type: 'mindmap', position: { x: 380, y: 280 }, data: { label: 'Wetter unberechenbar', kind: 'con' } },
  ];
  const edges = [
    { id: 'e-root-idea-1', source: 'root', target: 'idea-1' },
    { id: 'e-root-idea-2', source: 'root', target: 'idea-2' },
    { id: 'e-idea-1-pro-1', source: 'idea-1', target: 'pro-1' },
    { id: 'e-idea-1-con-1', source: 'idea-1', target: 'con-1' },
    { id: 'e-idea-2-pro-2', source: 'idea-2', target: 'pro-2' },
    { id: 'e-idea-2-con-2', source: 'idea-2', target: 'con-2' },
  ];

  await prisma.mindmap.create({
    data: {
      title: 'Urlaubsplanung',
      description: 'Wohin geht es im Sommer?',
      nodes,
      edges,
      familyId: family.id,
      createdById: anna.id,
    },
  });

  console.log('Seed completed:');
  console.log('  Family: Familie Muster');
  console.log('  Users:  anna@example.com (ADMIN), max@example.com — password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
