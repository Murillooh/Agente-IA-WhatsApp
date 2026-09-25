const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateAgentResponse } = require('./src/lib/ai/responder');

async function test() {
  process.env.OPENAI_API_KEY = "sk-fake-key-for-test";
  const leadId = '28875320-ced1-432e-8217-ea218de7c8bd';
  const scriptContent = "Você é o SDR virtual da Sereno Digital..."; // dummy content
  const history = [
    { role: 'user', content: 'Iae?' }
  ];
  
  console.log("Calling generateAgentResponse...");
  try {
    const reply = await generateAgentResponse(leadId, scriptContent, history);
    console.log("REPLY:", reply);
  } catch (e) {
    console.error("ERROR CAUGHT", e);
  }
}

test().finally(() => prisma.$disconnect());
