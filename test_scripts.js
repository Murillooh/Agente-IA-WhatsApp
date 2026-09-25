const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.script.findMany({where: {mode: 'MODO_1', channel: 'WHATSAPP', isActive: true}}).then(console.log).finally(() => prisma.$disconnect());
