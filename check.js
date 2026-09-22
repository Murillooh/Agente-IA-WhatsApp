const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const scripts = await prisma.script.findMany();
  const leads = await prisma.lead.findMany();
  console.log('Scripts:', scripts.length);
  console.log('Leads:', leads.map(l => l.phone));
}

check().finally(() => prisma.$disconnect());
