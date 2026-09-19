const SYSTEM = `You are a general IT service assistant. Give a short practical explanation (under 160 words) of the supplied service topics. Do not invent business facts, prices, contact details or guarantees. Do not request personal details, credentials or contact information. Refer users to the website contact section for service enquiries. You cannot book appointments or take actions.`;
// Only these fixed labels may leave the server. Never interpolate message text.
const TOPICS = [
  [/\b(cctv|camera|surveillance)\b/i, "CCTV and surveillance"],
  [/\b(amc|maintenance)\b/i, "Annual Maintenance Contracts"],
  [/\b(computer|laptop|desktop|hardware|repair)\b/i, "Computer hardware and repairs"],
  [/\b(network|networking|router|wifi|wi-fi|internet)\b/i, "Networking and Wi-Fi"],
  [/\b(server|backup|storage)\b/i, "Servers, storage and backups"],
  [/\b(printer|peripheral)\b/i, "Printers and peripherals"],
  [/\b(software|antivirus|installation)\b/i, "Software installation and antivirus"],
  [/\b(data|recovery)\b/i, "Data recovery and management"],
];

export function createChatMiddleware(
  env,
  { fetchImpl = fetch, now = Date.now, deployment = false } = {},
) {
  let requests = [];
  let active = 0;
  const reply = (res, status, data) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(data));
  };
  return async (req, res, next) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/chat" && path !== "/api/chat/status") return next();
    const expectedOrigin = `${deployment ? "https" : "http"}://${req.headers.host}`;
    const allowedHosts = deployment
      ? ["vihaan-infotech.vercel.app", env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean)
      : ["127.0.0.1:5173", "localhost:5173", "127.0.0.1:4173", "localhost:4173"];
    if (!deployment &&
      !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
        req.socket.remoteAddress,
      )
    )
      return reply(res, 403, { error: "Local access only." });
    if (
      !allowedHosts.includes(req.headers.host)
    )
      return reply(res, 403, { error: "Website access only." });
    if (
      req.headers.origin &&
      req.headers.origin !== expectedOrigin
    )
      return reply(res, 403, {
        error: "This request must come from this website.",
      });
    if (path === "/api/chat/status") {
      if (req.method !== "GET")
        return reply(res, 405, { error: "Method not allowed." });
      return reply(res, 200, {
        configured: Boolean(env.GEMINI_API_KEY),
        model: env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      });
    }
    if (req.method !== "POST")
      return reply(res, 405, { error: "Method not allowed." });
    if (
      req.headers.origin !== expectedOrigin ||
      !req.headers["content-type"]?.startsWith("application/json")
    )
      return reply(res, 403, {
        error: "This request must come from this website.",
      });
    requests = requests.filter((t) => now() - t < 60000);
    if (requests.length >= 8 || active >= 2)
      return reply(res, 429, {
        error: "Please wait a moment before sending another message.",
      });
    let body = "";
    try {
      if (req.body !== undefined) {
        body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      } else for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 120000)
          return reply(res, 413, {
            error: "Please send a shorter conversation.",
          });
      }
      if (Buffer.byteLength(body) > 120000)
        return reply(res, 413, { error: "Please send a shorter conversation." });
    } catch {
      return reply(res, 400, { error: "Could not read the message." });
    }
    let messages;
    try {
      messages = JSON.parse(body).messages;
    } catch {
      return reply(res, 400, { error: "Invalid message format." });
    }
    if (
      !Array.isArray(messages) ||
      !messages.length ||
      messages.length > 41 ||
      messages.some(
        (m, i) =>
          !m ||
          !["user", "model"].includes(m.role) ||
          typeof m.text !== "string" ||
          !m.text.trim() ||
          m.text.length > (m.role === "user" ? 2000 : 6000) ||
          m.role !== (i % 2 === 0 ? "user" : "model"),
      ) ||
      messages.at(-1).role !== "user"
    )
      return reply(res, 400, {
        error: "Please send a valid message of up to 2,000 characters.",
      });
    const latest = messages.at(-1).text;
    if (/\b(contact|phone|email|address|location|instagram|call|reach)\b/i.test(latest))
      return reply(res, 200, {
        reply: "Please use the Contact section on this website for our phone number, email and address. This answer is handled locally; your message is not sent to Google.",
      });
    const userText = messages.filter((m) => m.role === "user").map((m) => m.text).join(" ");
    const topics = TOPICS.filter(([pattern]) => pattern.test(userText)).map(([, label]) => label);
    if (!topics.length)
      return reply(res, 200, {
        reply: "I can help with CCTV, computers, networking, servers, AMC, printers, software and data recovery. Which service do you need? Your message text stays on this website; only predefined service topics are sent to Google.",
      });
    if (!env.GEMINI_API_KEY)
      return reply(res, 503, { error: "Chat is not configured. Please contact Vihaan Infotech directly." });
    requests.push(now());
    active++;
    try {
      const model = env.GEMINI_MODEL || "gemini-3.1-flash-lite";
      if (!/^gemini-[a-z0-9.-]+$/.test(model))
        return reply(res, 503, {
          error: "The chat model setting is invalid.",
        });
      const upstream = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: [{
              role: "user",
              parts: [{ text: "Explain these IT services: " + topics.join(", ") }],
            }],
            generationConfig: { maxOutputTokens: 550, temperature: 0.4 },
          }),
        },
      );
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const reason = data.error?.details?.find((d) => d.reason)?.reason;
        if (upstream.status === 429)
          return reply(res, 429, {
            error: "Gemini request limit reached. Please try again later.",
          });
        if ([400, 401, 403].includes(upstream.status))
          return reply(res, 502, {
            error:
              "Google rejected the Gemini key or its permissions. Please check the key in Google AI Studio.",
            code:
              reason === "API_KEY_INVALID" ? "invalid_key" : "authentication",
          });
        if (upstream.status === 404)
          return reply(res, 502, {
            error:
              "This Gemini model is not available for this key. Update the server model setting.",
          });
        return reply(res, 502, {
          error: "Gemini is temporarily unavailable. Please try again.",
        });
      }
      const text = data.candidates?.[0]?.content?.parts
        ?.filter((p) => !p.thought)
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (!text)
        return reply(res, 502, {
          error:
            "Gemini could not answer that message. Please try a different IT service question.",
        });
      return reply(res, 200, { reply: text });
    } catch {
      return reply(res, 502, {
        error:
          "Could not reach Gemini. Check your internet connection and try again.",
      });
    } finally {
      active--;
    }
  };
}
