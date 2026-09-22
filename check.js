const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const events = await prisma.conversationEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Events:', events.length, events);
}

check().finally(() => prisma.$disconnect());
