// Shared action store so chatbot screens can trigger actions in the live
// ChatbotScreen WITHOUT passing functions through navigation params
// (which are non-serializable and trigger React Navigation warnings).

let handlers = {
  onNewChat: null,     // () => void
  onPickHistory: null, // (id: string) => void
};

export const setChatActions = (next) => {
  handlers = { ...handlers, ...next };
};

export const runNewChat = () => {
  if (handlers.onNewChat) handlers.onNewChat();
};

export const runPickHistory = (id) => {
  if (handlers.onPickHistory) handlers.onPickHistory(id);
};
