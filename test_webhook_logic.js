
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getActiveScript } = require('./.next/server/app/api/webhooks/whatsapp/route.js') // Not possible directly easily

console.log('Testing logic');

