const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const username = 'muurisattos@gmail.com';
  console.log(`Setting ${username} as admin...`);
  
  try {
    const user = await prisma.user.update({
      where: { username },
      data: { isAdmin: true },
    });
    console.log(`Success! User ${user.username} is now an admin.`);
  } catch (err) {
    if (err.code === 'P2025') {
      console.error(`Error: User ${username} does not exist in the database. Please create the account first.`);
    } else {
      console.error(err);
    }
  } finally {
    await prisma.$disconnect();
  }
}
main();
