const fs = require('fs');
const { Client } = require('pg');

const envContent = fs.readFileSync('.env', 'utf-8');
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
let connectionString = match ? match[1] : null;

if (connectionString && connectionString.includes('?')) {
  connectionString = connectionString.split('?')[0];
}

if (!connectionString) {
  console.error('Error: DATABASE_URL not found or invalid format in .env');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('Connecting to AWS RDS...');
  try {
    await client.connect();
    console.log('Connected. Creating whatsapp_agent database...');
    await client.query('CREATE DATABASE whatsapp_agent');
    console.log('Database whatsapp_agent created successfully!');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database whatsapp_agent already exists!');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}
main();
