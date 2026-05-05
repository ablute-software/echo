async function runTest() {
  const baseUrl = process.env.ECHO_API_BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/echo/chat`;
  let history = [];

  const turns = [
    "vamos falar de irritações",
    "tudo me irrita",
    "pessoas lentas"
  ];

  console.log("=== INICIANDO TESTE ANTI-VORTEX ===");

  for (let i = 0; i < turns.length; i++) {
    const userMsg = turns[i];
    console.log(`\n--- Turno ${i + 1} ---`);
    console.log(`User: "${userMsg}"`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const echoReply = data.reply;
      console.log(`Echo: "${echoReply}"`);

      // Validation
      if (!echoReply || echoReply.trim() === '') {
        console.error("FALHOU: Resposta vazia.");
        process.exit(1);
      }

      const forbiddenPhrases = [
        "Por onde queres começar?",
        "Podemos pegar nisso devagar. Por onde queres começar?"
      ];

      for (const phrase of forbiddenPhrases) {
        if (echoReply.includes(phrase)) {
          console.error(`FALHOU: Contém frase proibida -> "${phrase}"`);
          process.exit(1);
        }
      }

      // Check repetition
      if (history.length > 0 && history[history.length - 1].content === echoReply) {
        console.error("FALHOU: Resposta idêntica ao turno anterior.");
        process.exit(1);
      }

      // Specific validations
      if (i === 1) { // "tudo me irrita"
        const lowerReply = echoReply.toLowerCase();
        if (!lowerReply.includes("tudo") && !lowerReply.includes("geral") && !lowerReply.includes("pacote") && !lowerReply.includes("saturação")) {
          console.warn("AVISO: A segunda resposta pode não ter reconhecido a saturação geral.");
        }
      }
      if (i === 2) { // "pessoas lentas"
        const lowerReply = echoReply.toLowerCase();
        if (!lowerReply.includes("pessoa") && !lowerReply.includes("lenta") && !lowerReply.includes("lentidão") && !lowerReply.includes("tempo") && !lowerReply.includes("ritmo")) {
          console.warn("AVISO: A terceira resposta pode não ter pego no conceito de 'lentidão' ou 'pessoas'.");
        }
      }

      // Update history for next turn
      history.push({ role: "user", content: userMsg });
      history.push({ role: "assistant", content: echoReply });

    } catch (e) {
      console.error("Erro ao contactar a API:", e.message);
      // If we don't have a valid key, we exit gracefully explaining that the test needs a valid key
      if (e.message.includes("fetch failed") || e.message.includes("OpenAI") || e.message.includes("HTTP error")) {
         console.error("\n[!] TESTE INTERROMPIDO: Provavelmente não tens uma OPENAI_API_KEY configurada no .env ou o servidor não está a correr.");
         process.exit(1); // Exiting with 1 since it's a test failure or environment failure
      }
      process.exit(1);
    }
  }

  console.log("\n=== TESTE ANTI-VORTEX CONCLUÍDO COM SUCESSO ===");
}

runTest();
