import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import { Contact } from '@/lib/crm';

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, contacts } = (await req.json()) as {
      messages: UIMessage[];
      contacts: Contact[];
    };

    const pipelineSummary = buildPipelineSummary(contacts);

    const result = streamText({
      model: ollama('llama3.2'),
      system: `You are an AI Sales Assistant embedded in a CRM application.
You help sales reps prioritize leads, suggest follow-up actions, and analyze their pipeline.

Current pipeline data:
${pipelineSummary}

Guidelines:
- Be concise and actionable. Use bullet points for lists of actions.
- Reference contacts by name when giving advice.
- If asked to "analyze" or "summarize", give specific numbers and percentages.
- If the user asks something unrelated to sales/CRM, politely redirect.
- Always ground your advice in the actual contact data provided above.`,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI Assist error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reach Ollama. Is it running on localhost:11434?' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Helper: build a text summary of the pipeline ──────────────────
function buildPipelineSummary(contacts: Contact[]): string {
  if (!contacts || contacts.length === 0) return 'No contacts in the pipeline.';

  const total = contacts.reduce((s, c) => s + c.value, 0);
  const byStatus = {
    lead: contacts.filter((c) => c.status === 'lead'),
    prospect: contacts.filter((c) => c.status === 'prospect'),
    customer: contacts.filter((c) => c.status === 'customer'),
    closed: contacts.filter((c) => c.status === 'closed'),
  };

  const lines = [
    `Total contacts: ${contacts.length}`,
    `Total pipeline value: $${total.toLocaleString()}`,
    `Leads: ${byStatus.lead.length}, Prospects: ${byStatus.prospect.length}, Customers: ${byStatus.customer.length}, Closed: ${byStatus.closed.length}`,
    '',
    'Contacts:',
    ...contacts.map(
      (c) =>
        `- ${c.name} (${c.company}) | ${c.status} | $${c.value.toLocaleString()} | Last contact: ${c.lastContact} | Notes: ${c.notes || 'none'} | Tags: ${c.tags.join(', ') || 'none'}`
    ),
  ];

  return lines.join('\n');
}
