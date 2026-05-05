import OpenAI from 'openai';
import { echoSystemPrompt } from './echoSystemPrompt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [], context = {} } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = [
      { role: "system", content: echoSystemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];

    const model = process.env.OPENAI_MODEL || "gpt-5.5";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      store: false
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({
      reply: reply,
      state: "responding",
      detectedKeywords: [], 
      suggestedTopics: [],
      conversationMode: "natural"
    });

  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    
    if (error.status === 404 || error.message.includes('model')) {
      return res.status(500).json({ error: "Modelo OpenAI inválido ou indisponível. Verifica OPENAI_MODEL no ambiente." });
    }
    
    return res.status(500).json({ error: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }
}
