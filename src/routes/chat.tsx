import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Sparkles, Send, User } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Travel Assistant — VELORA" }, { name: "description", content: "Chat with VELORA, your AI travel concierge." }] }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Plan a 5-day trip to Goa under ₹40,000",
  "What's the best time to visit Tokyo?",
  "Suggest hidden gems in Paris",
  "Vegetarian food guide for Bangkok",
];

function ChatPage() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => alert(e.message || "AI assistant is unavailable."),
  });
  const loading = status === "submitted" || status === "streaming";

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <div className="inline-grid h-14 w-14 place-items-center rounded-2xl gradient-hero text-white shadow-glow animate-float">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Your AI Travel Concierge</h1>
          <p className="mt-1 text-muted-foreground text-sm">Ask anything — destinations, visas, weather, itineraries.</p>
        </div>

        <div className="glass rounded-3xl p-4 sm:p-6 shadow-soft">
          <div ref={scrollRef} className="h-[55vh] overflow-y-auto pr-2 space-y-4">
            {messages.length === 0 && (
              <div className="grid sm:grid-cols-2 gap-3 mt-8">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => submit(s)} className="text-left p-4 rounded-xl bg-card hover:bg-primary/5 border transition-colors text-sm">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}>
                  {!isUser && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-hero text-white"><Sparkles className="h-4 w-4" /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${isUser ? "gradient-hero text-white" : "bg-card border"}`}>
                    {text || (loading ? <Typing /> : null)}
                  </div>
                  {isUser && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted"><User className="h-4 w-4" /></div>}
                </div>
              );
            })}
            {loading && messages.at(-1)?.role === "user" && (
              <div className="flex gap-3 animate-fade-up">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-hero text-white"><Sparkles className="h-4 w-4" /></div>
                <div className="bg-card border rounded-2xl px-4 py-3"><Typing /></div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask VELORA anything about travel…"
              className="flex-1 rounded-full border bg-background px-5 py-3 text-sm outline-none focus:ring-2 ring-primary"
            />
            <button type="submit" disabled={loading || !input.trim()} className="grid h-12 w-12 place-items-center rounded-full gradient-hero text-white shadow-glow disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}

function Typing() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "240ms" }} />
    </span>
  );
}