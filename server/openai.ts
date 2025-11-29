import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function chatWithAI(messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error: any) {
    console.error('[OpenAI] Error:', error);
    throw new Error('Failed to get AI response');
  }
}
