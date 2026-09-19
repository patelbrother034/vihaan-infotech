import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  ArrowUpRight,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import {
  readChatSession,
  saveChatSession,
  clearChatSession,
  buildChatContext,
  MAX_MESSAGES,
} from "./chat-session.mjs";
function storage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
export default function Chat() {
  const [initial] = useState(() => readChatSession(storage()));
  const [open, setOpen] = useState(false),
    [messages, setMessages] = useState(initial.messages),
    [input, setInput] = useState(initial.draft),
    [pending, setPending] = useState(""),
    [error, setError] = useState(""),
    [storageFailed, setStorageFailed] = useState(false);
  const inputRef = useRef(),
    bodyRef = useRef(),
    trigger = useRef(),
    lock = useRef(false);
  const busy = !!pending;
  const visibleMessages = pending
    ? [...messages, { role: "user", text: pending }]
    : messages;
  function save(history, draft) {
    setStorageFailed(!saveChatSession(storage(), history, draft));
  }
  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [open, busy]);
  useEffect(() => {
    if (open && bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, pending, error, open]);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function reset() {
    if (lock.current) return;
    setMessages([]);
    setInput("");
    setError("");
    setStorageFailed(!clearChatSession(storage()));
    inputRef.current?.focus();
  }
  async function send(text) {
    const trimmed = text.trim();
    if (lock.current || !trimmed) return;
    lock.current = true;
    save(messages, trimmed);
    setPending(trimmed);
    setInput("");
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildChatContext(messages, trimmed) }),
        signal: AbortSignal.timeout(30000),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Chat is temporarily unavailable. Your conversation and draft are kept in this tab. Please try again shortly.",
        );
      }
      if (!response.ok)
        throw new Error(data.error || "Chat is unavailable. Please try again.");
      if (typeof data.reply !== "string" || !data.reply.trim())
        throw new Error(
          "No answer was received. Your message is ready to retry.",
        );
      const next = [
        ...messages,
        { role: "user", text: trimmed },
        { role: "model", text: data.reply.slice(0, 6000) },
      ].slice(-MAX_MESSAGES);
      setMessages(next);
      save(next, "");
    } catch (e) {
      setError(
        e.name === "TimeoutError"
          ? "The response took too long. Your conversation is kept; send your message again."
          : e instanceof TypeError
            ? "Cannot reach chat. Your conversation and draft are kept in this tab. Please check your connection and try again."
            : e.message,
      );
      setInput(trimmed);
      save(messages, trimmed);
    } finally {
      setPending("");
      lock.current = false;
    }
  }
  return (
    <>
      {open && (
        <section
          className="chat-panel"
          role="dialog"
          aria-label="Ask Vihaan"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <div className="chat-header">
            <span className="chat-symbol">
              <Sparkles size={20} />
            </span>
            <div>
              <h2>Ask Vihaan</h2>
              <p>IT service assistant · Gemini</p>
            </div>
            <button
              className="icon-button"
              aria-label="Close chat"
              onClick={close}
            >
              <X size={20} />
            </button>
          </div>
          <div className="chat-session-bar">

            <button
              type="button"
              onClick={reset}
              disabled={busy || (!messages.length && !input)}
              aria-label="Start new conversation"
            >
              <RotateCcw size={14} />
              New chat
            </button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {visibleMessages.length === 0 && (
              <>
                <p className="chat-greeting">
                  Hello! What can we help you connect, protect or maintain?
                </p>
                <div className="chat-suggestions">
                  {[
                    "I need CCTV for my office",
                    "What does AMC cover?",
                    "Help me plan a network",
                  ].map((t) => (
                    <button key={t} disabled={busy} onClick={() => send(t)}>
                      {t}
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
              </>
            )}
            <div
              className="chat-messages"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {visibleMessages.map((m, i) => (
                <div className={"chat-message " + m.role} key={i}>
                  <span>{m.role === "user" ? "You" : "Vihaan assistant"}</span>
                  <p>{m.text}</p>
                </div>
              ))}
              {busy && (
                <p className="chat-loading" role="status">
                  <span className="thinking-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  Thinking about your requirement…
                </p>
              )}
            </div>
            {error && (
              <p className="chat-error" role="alert">
                {error}
              </p>
            )}
            {storageFailed && (
              <p className="chat-error" role="status">
                Browser storage is unavailable. This conversation will be lost
                on refresh.
              </p>
            )}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              aria-label="Your message"
              value={input}
              maxLength={2000}
              onChange={(e) => {
                setInput(e.target.value);
                save(messages, e.target.value);
              }}
              placeholder="Ask about your IT requirement…"
              disabled={busy}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={busy || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        ref={trigger}
        className="chat-launcher"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "Close Ask Vihaan" : "Open Ask Vihaan"}
      >
        <MessageCircle size={20} />
        <span>Ask Vihaan</span>
      </button>
    </>
  );
}


