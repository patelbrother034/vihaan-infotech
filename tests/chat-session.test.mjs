import test from "node:test";
import assert from "node:assert/strict";
import {
  readChatSession,
  saveChatSession,
  clearChatSession,
  buildChatContext,
  MAX_MESSAGES,
} from "../src/chat-session.mjs";
function store() {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
  };
}
const pair = [
  { role: "user", text: "My office needs seven cameras." },
  { role: "model", text: "Which areas need coverage?" },
];
test("restores complete conversation and unsent draft after refresh", () => {
  const s = store();
  saveChatSession(s, pair, "Can these be monitored remotely?");
  assert.deepEqual(readChatSession(s), {
    messages: pair,
    draft: "Can these be monitored remotely?",
  });
});
test("a fresh tab session is empty and clearing removes previous context", () => {
  const s = store();
  saveChatSession(s, pair);
  assert.deepEqual(readChatSession(store()), { messages: [], draft: "" });
  clearChatSession(s);
  assert.deepEqual(readChatSession(s), { messages: [], draft: "" });
});
test("corrupt or unpaired stored history is ignored", () => {
  for (const value of [
    "not json",
    JSON.stringify({ version: 1, messages: [pair[0]] }),
    JSON.stringify({ version: 1, messages: [pair[1], pair[0]] }),
  ]) {
    const s = { getItem: () => value };
    assert.deepEqual(readChatSession(s), { messages: [], draft: "" });
  }
});
test("storage failures preserve usability instead of throwing", () => {
  const s = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("full");
    },
    removeItem() {
      throw Error("blocked");
    },
  };
  assert.deepEqual(readChatSession(s), { messages: [], draft: "" });
  assert.equal(saveChatSession(s, pair), false);
  assert.equal(clearChatSession(s), false);
});
test("follow-ups include the earlier user requirement and model answer", () => {
  assert.deepEqual(buildChatContext(pair, "How many cameras did I mention?"), [
    ...pair,
    { role: "user", text: "How many cameras did I mention?" },
  ]);
});
test("long conversations are bounded on complete exchanges", () => {
  const history = Array.from({ length: 60 }, (_, i) => ({
    role: i % 2 ? "model" : "user",
    text: "x".repeat(i % 2 ? 3000 : 1500),
  }));
  const context = buildChatContext(history, "Latest question");
  assert.ok(context.length <= MAX_MESSAGES + 1);
  assert.equal(context.at(-1).text, "Latest question");
  assert.ok(context.reduce((n, m) => n + m.text.length, 0) <= 24000);
  assert.ok(context.every((m, i) => m.role === (i % 2 ? "model" : "user")));
});
