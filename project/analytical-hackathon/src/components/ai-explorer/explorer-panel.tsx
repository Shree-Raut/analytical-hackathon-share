"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { ChatMessage, type ChartConfig, type MessageMetadata } from "./chat-message";
import { SuggestedQuestions } from "./suggested-questions";
import { useCustomer } from "@/lib/customer-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: ChartConfig;
  metadata?: MessageMetadata;
}

interface ExplorerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREBUILT_QUESTIONS = [
  "What's the current portfolio occupancy trend?",
  "Which properties have delinquency issues?",
  "How are AI agents performing this month?",
  "Show me the NOI waterfall for the southeast region",
];

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export function ExplorerPanel({ isOpen, onClose }: ExplorerPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { customer } = useCustomer();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const askQuestion = useCallback(
    async (question: string): Promise<Message> => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            customerId: customer?.id,
          }),
        });
        const data = await res.json();
        return {
          id: nextId(),
          role: "assistant",
          content: data.answer ?? "Sorry, I couldn't process that question.",
          chart: data.chart ?? undefined,
          metadata: data.metadata ?? undefined,
        };
      } catch {
        return {
          id: nextId(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
      }
    },
    [customer?.id],
  );

  useEffect(() => {
    if (!isOpen || initialized) return;

    let cancelled = false;
    async function loadPrebuilt() {
      const pairs: Message[] = [];

      const results = await Promise.all(
        PREBUILT_QUESTIONS.map((q) => askQuestion(q)),
      );

      for (let i = 0; i < PREBUILT_QUESTIONS.length; i++) {
        pairs.push({
          id: nextId(),
          role: "user",
          content: PREBUILT_QUESTIONS[i],
        });
        pairs.push(results[i]);
      }

      if (!cancelled) {
        setMessages(pairs);
        setInitialized(true);
      }
    }

    loadPrebuilt();
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialized, askQuestion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  async function handleSend(question?: string) {
    const q = (question ?? input).trim();
    if (!q || isLoading) return;

    const userMsg: Message = { id: nextId(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantMsg = await askQuestion(q);
    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  }

  function handlePin(msg: Message) {
    if (!customer?.id) return;
    fetch("/api/ai/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: msg.content,
        answer: msg.content,
        metricsUsed: msg.metadata?.metrics,
        filtersApplied: { filters: msg.metadata?.filters ?? "" },
        chartConfig: msg.chart?.config,
        customerId: customer.id,
      }),
    });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[480px] z-50 bg-white border-l border-[#e8dfd4] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8dfd4] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#7d654e]" />
            <h2 className="text-[#1a1510] font-semibold text-base">AI Explorer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#7d654e] hover:text-[#1a1510] transition-colors p-1 rounded-md hover:bg-[#f7f3ef]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        >
          {messages.length === 0 && !initialized && (
            <div className="flex flex-col items-center justify-center h-full text-[#7d654e] gap-3">
              <Loader2 size={24} className="animate-spin text-[#7d654e]" />
              <span className="text-sm">Loading portfolio insights…</span>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              chart={msg.chart}
              metadata={msg.metadata}
              onPin={msg.role === "assistant" ? () => handlePin(msg) : undefined}
              onSave={msg.role === "assistant" ? () => handlePin(msg) : undefined}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#faf7f4] border border-[#e8dfd4] rounded-xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#7d654e] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-[#7d654e] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-[#7d654e] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-[#7d654e] text-xs ml-1">Analyzing…</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {initialized && messages.length <= 8 && (
          <SuggestedQuestions onSelect={(q) => handleSend(q)} />
        )}

        {/* Input bar */}
        <div className="px-4 pb-4 pt-2 border-t border-[#e8dfd4] shrink-0">
          <div className="flex items-center gap-2 bg-[#faf7f4] border border-[#e8dfd4] rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about your portfolio…"
              className="flex-1 bg-transparent text-sm text-[#1a1510] placeholder:text-[#7d654e]/50 outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-[#7d654e] hover:bg-[#7d654e]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg p-1.5 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
