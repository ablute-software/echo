import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { echoSystemPrompt } from './echo/echoSystemPrompt.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// Mapeamento de instâncias da OpenAI
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (e) {
  console.error("OpenAI initialization error:", e.message);
}

app.post('/api/echo/chat', async (req, res) => {
  const { message, history = [], context = {} } = req.body;

  if (!openai) {
    return res.status(500).json({ error: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }

  try {
    // Build the messages array
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

    // Retorna o formato esperado (simulando extração de keywords para não quebrar contrato visual, caso o frontend os use)
    res.json({
      reply: reply,
      state: "responding",
      detectedKeywords: [], // Extracção simples não obrigatória nesta fase, enviamos vazio
      suggestedTopics: [],
      conversationMode: "natural"
    });

  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    
    if (error.status === 404 || error.message.includes('model')) {
      return res.status(500).json({ error: "Modelo OpenAI inválido ou indisponível. Verifica OPENAI_MODEL no .env." });
    }
    
    res.status(500).json({ error: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }
});

app.listen(port, () => {
  console.log(`_echo backend listening on port ${port}`);
});
