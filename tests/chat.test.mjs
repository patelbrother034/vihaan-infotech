import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { createChatMiddleware } from "../server/chat.mjs";
const good = { messages: [{ role: "user", text: "What does AMC cover?" }] };
async function run(
  middleware,
  {
    url = "/api/chat",
    method = "POST",
    origin = "http://127.0.0.1:5173",
    body = good,
    host = "127.0.0.1:5173",
    remoteAddress = "127.0.0.1",
    parsed = false,
  } = {},
) {
  const req = Readable.from([JSON.stringify(body)]);
  req.url = url;
  req.method = method;
  req.headers = { host, origin, "content-type": "application/json" };
  req.socket = { remoteAddress };
  if (parsed) req.body = body;
  const res = {
    setHeader() {},
    end(value) {
      this.body = JSON.parse(value);
    },
  };
  await middleware(req, res, () => {
    throw Error("Unexpected route fallthrough");
  });
  return res;
}
test("rejects foreign origins before sending anything to Google", async () => {
  let called = false;
  const m = createChatMiddleware(
    { GEMINI_API_KEY: "test-key" },
    {
      fetchImpl: async () => {
        called = true;
      },
    },
  );
  const res = await run(m, { origin: "https://other.example" });
  assert.equal(res.statusCode, 403);
  assert.equal(called, false);
});

test("Vercel accepts HTTPS production and preview requests with parsed bodies", async () => {
  let calls = 0;
  const m = createChatMiddleware(
    { GEMINI_API_KEY: "test-key", VERCEL_URL: "preview-example.vercel.app" },
    { deployment: true, fetchImpl: async () => {
      calls++;
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "Hello" }] } }] }) };
    } },
  );
  for (const host of ["vihaan-infotech.vercel.app", "preview-example.vercel.app"]) {
    const res = await run(m, { host, origin: `https://${host}`, remoteAddress: "10.0.0.1", parsed: true });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.reply, "Hello");
  }
  assert.equal(calls, 2);
});

test("Vercel rejects foreign, missing and insecure origins and unknown hosts", async () => {
  const m = createChatMiddleware({ GEMINI_API_KEY: "test-key" }, {
    deployment: true, fetchImpl: async () => { throw new Error("Must not contact Google"); },
  });
  for (const origin of ["https://other.example", undefined, "http://vihaan-infotech.vercel.app"]) {
    // null preserves an absent origin through the helper's default value.
    const res = await run(m, { host: "vihaan-infotech.vercel.app", origin: origin ?? null });
    assert.equal(res.statusCode, 403);
  }
  assert.equal((await run(m, { host: "other.example", origin: "https://other.example" })).statusCode, 403);
});

test("Vercel rejects oversized parsed payloads and invalid messages", async () => {
  const m = createChatMiddleware({ GEMINI_API_KEY: "test-key" }, { deployment: true });
  const options = { host: "vihaan-infotech.vercel.app", origin: "https://vihaan-infotech.vercel.app", parsed: true };
  assert.equal((await run(m, { ...options, body: { padding: "x".repeat(120001) } })).statusCode, 413);
  assert.equal((await run(m, { ...options, body: { messages: [] } })).statusCode, 400);
});

test("local middleware still blocks remote access", async () => {
  const res = await run(createChatMiddleware({ GEMINI_API_KEY: "test-key" }), { remoteAddress: "10.0.0.1" });
  assert.equal(res.statusCode, 403);
});
test("rejects oversized messages without contacting Google", async () => {
  let called = false;
  const m = createChatMiddleware(
    { GEMINI_API_KEY: "test-key" },
    {
      fetchImpl: async () => {
        called = true;
      },
    },
  );
  const res = await run(m, {
    body: { messages: [{ role: "user", text: "x".repeat(2001) }] },
  });
  assert.equal(res.statusCode, 400);
  assert.equal(called, false);
});
test("status exposes configuration state but not the key", async () => {
  const res = await run(
    createChatMiddleware({ GEMINI_API_KEY: "secret-test-value" }),
    { url: "/api/chat/status", method: "GET" },
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.configured, true);
  assert.equal(JSON.stringify(res.body).includes("secret-test-value"), false);
});
test("sends the key only in the Google header and extracts the answer", async () => {
  let captured;
  const m = createChatMiddleware(
    { GEMINI_API_KEY: "secret-test-value" },
    {
      fetchImpl: async (url, options) => {
        captured = { url, options };
        return {
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    { text: "Private thought", thought: true },
                    { text: "AMC includes preventive maintenance." },
                  ],
                },
              },
            ],
          }),
        };
      },
    },
  );
  const res = await run(m);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.reply, "AMC includes preventive maintenance.");
  assert.equal(captured.options.headers["x-goog-api-key"], "secret-test-value");
  assert.equal(captured.url.includes("secret-test-value"), false);
  assert.ok(JSON.parse(captured.options.body).systemInstruction);
});
test("does not return raw Google errors or keys to the browser", async () => {
  const m = createChatMiddleware(
    { GEMINI_API_KEY: "secret-test-value" },
    {
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        json: async () => ({
          error: { message: "secret-test-value sensitive upstream diagnostic" },
        }),
      }),
    },
  );
  const res = await run(m);
  assert.equal(res.statusCode, 502);
  assert.equal(JSON.stringify(res.body).includes("secret-test-value"), false);
});
test("caps local requests to eight per minute", async () => {
  let calls = 0;
  const m = createChatMiddleware(
    { GEMINI_API_KEY: "test-key" },
    {
      now: () => 1000,
      fetchImpl: async () => {
        calls++;
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: "OK" }] } }],
          }),
        };
      },
    },
  );
  for (let i = 0; i < 8; i++) assert.equal((await run(m)).statusCode, 200);
  assert.equal((await run(m)).statusCode, 429);
  assert.equal(calls, 8);
});

test("forwards the full ordered conversation including longer model replies", async () => {
  let sent;
  const messages = [
    { role: "user", text: "I have seven cameras." },
    { role: "model", text: "A".repeat(2500) },
    { role: "user", text: "How many did I mention?" },
  ];
  const middleware = createChatMiddleware(
    { GEMINI_API_KEY: "test-key" },
    {
      fetchImpl: async (url, options) => {
        sent = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: "Seven cameras." }] } }],
          }),
        };
      },
    },
  );
  const res = await run(middleware, { body: { messages } });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(
    sent.contents,
    messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
  );
});
test("rejects history that starts with a model message", async () => {
  let called = false;
  const middleware = createChatMiddleware(
    { GEMINI_API_KEY: "test-key" },
    {
      fetchImpl: async () => {
        called = true;
      },
    },
  );
  const res = await run(middleware, {
    body: {
      messages: [
        { role: "model", text: "wrong start" },
        { role: "user", text: "hello" },
      ],
    },
  });
  assert.equal(res.statusCode, 400);
  assert.equal(called, false);
});
