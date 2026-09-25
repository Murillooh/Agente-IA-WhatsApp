import { generateAgentResponse } from './src/lib/ai/responder';
import { getActiveScript } from './src/lib/repo/scripts';
import { listEventsForLead } from './src/lib/repo/events';
import { sendWhatsAppMessage } from './src/lib/integrations/whatsapp';

async function run() {
  const leadId = '28875320-ced1-432e-8217-ea218de7c8bd';
  const userId = '005c9055-0c7c-4c50-9eff-fa32c3fc65f4';
  
  console.log('Fetching script...');
  const script = await getActiveScript('MODO_1', 'WHATSAPP');
  console.log('Script:', script ? script.name : 'null');
  
  if (!script) return;
  
  console.log('Fetching events...');
  const events = await listEventsForLead(leadId, userId);
  const history = events.map(e => ({
    role: e.direction === 'ENTRADA' ? 'user' : 'assistant',
    content: e.content
  }));
  console.log('History length:', history.length);
  
  console.log('Generating response...');
  const aiReply = await generateAgentResponse(leadId, script.content, history);
  console.log('AI Reply:', aiReply);
  
  if (aiReply) {
    console.log('Sending whatsapp message...');
    const sendRes = await sendWhatsAppMessage({
      leadId,
      to: '5511951366825',
      message: aiReply
    });
    console.log('Send Result:', sendRes);
  }
}
run().catch(console.error);

