const KEY = "vihaan-chat-session-v1";
export const MAX_MESSAGES = 40;
const valid = (m) =>
  m &&
  ["user", "model"].includes(m.role) &&
  typeof m.text === "string" &&
  m.text.trim() &&
  m.text.length <= (m.role === "user" ? 2000 : 6000);
export function readChatSession(storage) {
  try {
    const data = JSON.parse(storage.getItem(KEY) || "null");
    if (
      !data ||
      data.version !== 1 ||
      !Array.isArray(data.messages) ||
      data.messages.length > MAX_MESSAGES ||
      data.messages.length % 2 ||
      data.messages.some(
        (m, i) => !valid(m) || m.role !== (i % 2 ? "model" : "user"),
      )
    )
      return { messages: [], draft: "" };
    return {
      messages: data.messages.map(({ role, text }) => ({ role, text })),
      draft: typeof data.draft === "string" ? data.draft.slice(0, 2000) : "",
    };
  } catch {
    return { messages: [], draft: "" };
  }
}
export function saveChatSession(storage, messages, draft = "") {
  try {
    storage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        messages: messages.slice(-MAX_MESSAGES),
        draft: draft.slice(0, 2000),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
export function clearChatSession(storage) {
  try {
    storage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
export function buildChatContext(messages, text) {
  const context = [{ role: "user", text: text.trim() }];
  let length = context[0].text.length;
  for (
    let i = messages.length - 2;
    i >= 0 && context.length < MAX_MESSAGES;
    i -= 2
  ) {
    const pair = messages.slice(i, i + 2);
    const size = pair.reduce((n, m) => n + m.text.length, 0);
    if (length + size > 24000) break;
    context.unshift(...pair);
    length += size;
  }
  return context;
}
