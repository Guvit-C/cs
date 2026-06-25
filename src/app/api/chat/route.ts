import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: "You are an expert IGCSE Computer Science tutor. Your goal is to help the user review and practice computer science concepts based on their mistakes. Be encouraging, concise, and clear.",
    messages,
  });

  // @ts-ignore - handle ai sdk version differences
  return result.toTextStreamResponse ? result.toTextStreamResponse() : result.toDataStreamResponse();
}
