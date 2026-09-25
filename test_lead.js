const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.lead.findUnique({where: {id: '28875320-ced1-432e-8217-ea218de7c8bd'}}).then(console.log).finally(() => prisma.$disconnect());
