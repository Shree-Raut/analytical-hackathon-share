import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Send,
  User,
} from "lucide-react";
import type { ChatMessage, MappingEntry } from "./types";

interface StepConversationProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onSuggestedClick: (answer: string) => void;
  typing: boolean;
  suggestedAnswer: string;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  mappings: MappingEntry[];
  done: boolean;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function StepConversation({
  messages,
  input,
  onInputChange,
  onSend,
  onSuggestedClick,
  typing,
  suggestedAnswer,
  chatEndRef,
  mappings,
  done,
  loading,
  onNext,
  onBack,
}: StepConversationProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={32} className="text-[#7d654e] animate-spin" />
        <p className="text-sm text-[#7d654e]">Analyzing ambiguous columns...</p>
      </div>
    );
  }

  const renderMessageText = (text: string) => {
    return text.split("\n").map((line, lineIndex) => {
      const segments = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={`line-${lineIndex}`}>
          {segments.map((segment, segmentIndex) =>
            segment.startsWith("**") && segment.endsWith("**") ? (
              <strong key={`seg-${lineIndex}-${segmentIndex}`}>
                {segment.slice(2, -2)}
              </strong>
            ) : (
              <span key={`seg-${lineIndex}-${segmentIndex}`}>{segment}</span>
            ),
          )}
          {lineIndex < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div
          className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm flex flex-col"
          style={{ height: 520 }}
        >
          <div className="px-5 py-3.5 border-b border-[#e8dfd4] flex items-center gap-2">
            <Bot size={16} className="text-[#7d654e]" />
            <span className="text-sm font-semibold text-[#1a1510]">
              Mapping Assistant
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "agent" && (
                  <div className="w-7 h-7 rounded-full bg-[#f7f3ef] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-[#7d654e]" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#7d654e] text-white"
                      : "bg-[#f7f3ef] text-[#1a1510]"
                  }`}
                >
                  {renderMessageText(msg.text)}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[#eddece] flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-[#7d654e]" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#f7f3ef] flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-[#7d654e]" />
                </div>
                <div className="bg-[#f7f3ef] px-4 py-3 rounded-xl">
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-[#7d654e] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#7d654e] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#7d654e] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-[#e8dfd4]">
            {done ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2.5">
                <CheckCircle2 size={16} />
                All columns confirmed. Ready to preview.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.length > 0 &&
                  messages[messages.length - 1].role === "agent" &&
                  messages[messages.length - 1].options &&
                  (messages[messages.length - 1].options?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {messages[messages.length - 1].options!.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onSuggestedClick(opt)}
                          className="px-2.5 py-1 text-xs font-medium text-[#7d654e] bg-[#eddece] rounded-lg hover:bg-[#e3cebe] transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                    placeholder={suggestedAnswer || "Type your response..."}
                    className="flex-1 px-3.5 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510] placeholder:text-[#7d654e]/40 transition-colors"
                  />
                  {suggestedAnswer && !input && (
                    <button
                      type="button"
                      onClick={() => onSuggestedClick(suggestedAnswer)}
                      className="px-3 py-2 text-xs font-medium text-[#7d654e] bg-[#eddece] rounded-lg hover:bg-[#e3cebe] transition-colors whitespace-nowrap"
                    >
                      Use &ldquo;{suggestedAnswer}&rdquo;
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={!input.trim()}
                    className="px-3 py-2 bg-[#7d654e] text-white rounded-lg hover:bg-[#6b5642] transition-colors disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm flex flex-col"
          style={{ height: 520 }}
        >
          <div className="px-5 py-3.5 border-b border-[#e8dfd4]">
            <span className="text-sm font-semibold text-[#1a1510]">
              Mapping Status
            </span>
            <span className="ml-2 text-xs text-[#7d654e]">
              {
                mappings.filter(
                  (m) => !m.excluded && (m.status === "confirmed" || m.confidence >= 85),
                ).length
              }
              /{mappings.filter((m) => !m.excluded).length} resolved
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
            {mappings.map((m) => (
              <div
                key={m.sourceHeader}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                  m.status === "confirmed"
                    ? "bg-emerald-50/60"
                    : m.confidence >= 85
                      ? "bg-emerald-50/40"
                      : m.confidence >= 40
                        ? "bg-amber-50/40"
                        : "bg-red-50/40"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    m.status === "confirmed"
                      ? "bg-emerald-500"
                      : m.confidence >= 85
                        ? "bg-emerald-400"
                        : m.confidence >= 40
                          ? "bg-amber-400"
                          : "bg-red-400"
                  }`}
                />
                <span className="font-medium text-[#1a1510] w-28 shrink-0 truncate">
                  {m.sourceHeader}
                </span>
                <ArrowRight size={10} className="text-[#7d654e]" />
                <span className="text-[#7d654e] flex-1 truncate">
                  {m.matchedMetric || "Unmapped"}
                </span>
                <span className="tabular-nums text-[#7d654e]/60">
                  {m.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!done}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7d654e] text-white text-sm font-medium rounded-lg hover:bg-[#6b5642] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Preview Live Report
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
