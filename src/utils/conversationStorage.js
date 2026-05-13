const STORAGE_KEY = 'echo_conversations';
const SUMMARY_KEY = 'echo_conversation_summary';

export function getLocalTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getAllConversations() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function getConversation(date) {
  const convos = getAllConversations();
  return convos.find(c => c.conversation_date === date);
}

export function getConversationSummary() {
  const data = localStorage.getItem(SUMMARY_KEY);
  if (!data) return "";
  return data;
}

export function saveConversationSummary(summary) {
  if (typeof summary === 'string' && summary.trim().length > 0) {
    // Limit storage just in case
    localStorage.setItem(SUMMARY_KEY, summary.slice(0, 500));
  }
}

export function saveMessage(date, messageObj) {
  const convos = getAllConversations();
  let convo = convos.find(c => c.conversation_date === date);

  if (!convo) {
    convo = {
      conversation_id: `conv_${Date.now()}`,
      user_id: 'local_user',
      conversation_date: date,
      status: 'active',
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      messages: []
    };
    convos.push(convo);
  }

  // Ensure unique internal message structure
  const finalMessage = {
    message_id: messageObj.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    conversation_id: convo.conversation_id,
    user_id: 'local_user',
    conversation_date: date,
    timestamp: new Date().toISOString(),
    sender: messageObj.sender,
    visible_text: messageObj.text,
    internal_analysis_id: messageObj.internal_analysis_id || null,
    created_at: new Date().toISOString()
  };

  convo.messages.push(finalMessage);
  convo.last_message_at = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
  return finalMessage;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SUMMARY_KEY);
}

export function getHistorySummaries() {
  const convos = getAllConversations();
  // Sort by date descending
  convos.sort((a, b) => new Date(b.conversation_date) - new Date(a.conversation_date));
  
  return convos.map(c => {
    // Attempt to find a good preview message
    const userMessage = c.messages.find(m => m.sender === 'user');
    const echoMessage = c.messages.find(m => m.sender === 'echo');
    
    return {
      id: c.conversation_id,
      date: c.conversation_date,
      preview: userMessage ? userMessage.visible_text : (echoMessage ? echoMessage.visible_text : "Conversa vazia"),
      messageCount: c.messages.length
    };
  });
}
