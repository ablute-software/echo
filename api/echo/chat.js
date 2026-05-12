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

    // Append any existing user context to the system prompt dynamically
    if (context && Object.keys(context).length > 0) {
      messages[0].content += `\n\n=== CURRENT USER CONTEXT ===\nUse this to personalize the conversation:\n${JSON.stringify(context)}`;
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"; // Fallback to json compatible model

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }, // Force JSON response
      store: false
    });

    const replyText = completion.choices[0].message.content;
    let parsedData = {};
    
    try {
      parsedData = JSON.parse(replyText);
    } catch (e) {
      console.error("Failed to parse JSON from LLM:", replyText);
      // Fallback if LLM fails JSON rules
      parsedData = {
        visible_reply: replyText,
        internal_analysis: {}
      }
    }

    return res.status(200).json({
      reply: parsedData.visible_reply || "Não consegui formular uma resposta.",
      analysis: parsedData.internal_analysis || {},
      state: "responding"
    });

  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    
    if (error.status === 404 || error.message.includes('model')) {
      return res.status(500).json({ error: "Modelo OpenAI inválido ou indisponível. Verifica OPENAI_MODEL no ambiente." });
    }
    
    return res.status(500).json({ error: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }
}
