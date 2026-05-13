import OpenAI from 'openai';
import { echoSystemPrompt } from './echoSystemPrompt.js';

// Rate limiting (in-memory fallback for local dev. Use Redis para serverless/produção!)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = parseInt(process.env.ECHO_RATE_LIMIT_PER_HOUR || "100", 10);

function saveEchoReport(reportData) {
  // Backoffice placeholder
  // Em desenvolvimento, apenas faz log. Num sistema real, guardaria na BD do backoffice.
  // console.log("[Backoffice] Novo mini-report gravado:", JSON.stringify(reportData, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Rate limiting validation
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, startTime: now };
  
  if (now - userRate.startTime > RATE_LIMIT_WINDOW_MS) {
    userRate.count = 1;
    userRate.startTime = now;
  } else {
    userRate.count += 1;
  }
  rateLimitMap.set(ip, userRate);

  if (userRate.count > MAX_REQUESTS_PER_HOUR) {
    return res.status(429).json({ error: 'rate_limited', message: 'Limite temporário atingido. Tenta novamente mais tarde.' });
  }

  const { message, conversationSummary, conversationId } = req.body;

  // Input Validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'invalid_input', message: 'A mensagem não pode estar vazia.' });
  }
  
  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 500) {
    return res.status(400).json({ error: 'invalid_input', message: 'A mensagem deve ter no máximo 500 caracteres.' });
  }

  if (conversationSummary && typeof conversationSummary === 'string' && conversationSummary.length > 500) {
    return res.status(400).json({ error: 'invalid_input', message: 'Resumo demasiado longo.' });
  }

  // Mock Mode
  if (process.env.USE_MOCK_LLM === 'true') {
    const mockResponse = {
      visible_reply: "Isto é uma resposta gerada localmente em modo Mock. Como te sentes com isso?",
      speech_reply: "Isto é uma resposta gerada localmente em modo Moca. Como te sentes com isso?",
      mini_report: {
        summary: "Utilizador a testar o modo mock.",
        emotional_tone: "neutro",
        energy: "media",
        keywords: ["mock", "teste"],
        next_signal_to_explore: "Nenhum"
      },
      safety: {
        risk_level: "none",
        requires_human_review: false
      },
      updated_conversation_summary: conversationSummary ? conversationSummary.substring(0, 480) + " | Mock test" : "Mock test"
    };

    saveEchoReport({
      conversationId,
      timestamp: new Date().toISOString(),
      userMessage: trimmedMessage,
      visible_reply: mockResponse.visible_reply,
      mini_report: mockResponse.mini_report,
      safety: mockResponse.safety
    });

    return res.status(200).json(mockResponse);
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'server_error', message: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let systemPromptContent = echoSystemPrompt;
    if (conversationSummary) {
      systemPromptContent += `\n\n=== RESUMO DA CONVERSA ATÉ AGORA ===\n${conversationSummary}`;
    }

    const messages = [
      { role: "system", content: systemPromptContent },
      { role: "user", content: trimmedMessage }
    ];

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { 
        type: "json_schema", 
        json_schema: {
          name: "echo_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              visible_reply: { type: "string" },
              speech_reply: { type: "string" },
              mini_report: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  emotional_tone: { type: "string" },
                  energy: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                  next_signal_to_explore: { type: "string" }
                },
                required: ["summary", "emotional_tone", "energy", "keywords", "next_signal_to_explore"],
                additionalProperties: false
              },
              safety: {
                type: "object",
                properties: {
                  risk_level: { type: "string" },
                  requires_human_review: { type: "boolean" }
                },
                required: ["risk_level", "requires_human_review"],
                additionalProperties: false
              },
              updated_conversation_summary: { type: "string" }
            },
            required: ["visible_reply", "speech_reply", "mini_report", "safety", "updated_conversation_summary"],
            additionalProperties: false
          }
        }
      },
      store: false
    });

    const replyText = completion.choices[0].message.content;
    let parsedData = {};
    
    try {
      parsedData = JSON.parse(replyText);
    } catch (e) {
      console.error("Failed to parse JSON from LLM:", replyText);
      return res.status(500).json({ error: 'server_error', message: "Erro interno ao processar a resposta do modelo." });
    }

    saveEchoReport({
      conversationId,
      timestamp: new Date().toISOString(),
      userMessage: trimmedMessage,
      visible_reply: parsedData.visible_reply,
      mini_report: parsedData.mini_report,
      safety: parsedData.safety
    });

    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    
    if (error.status === 404 || (error.message && error.message.includes('model'))) {
      return res.status(500).json({ error: 'server_error', message: "Modelo OpenAI inválido ou indisponível. Verifica OPENAI_MODEL no ambiente." });
    }
    
    return res.status(500).json({ error: 'server_error', message: "Não consegui responder agora. Verifica a configuração da OpenAI." });
  }
}
