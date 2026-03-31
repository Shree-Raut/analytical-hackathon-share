"use client";

const SUGGESTIONS = [
  "What's driving occupancy changes?",
  "Show me delinquency trends",
  "How is AI performing this month?",
  "Compare my top 5 properties",
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {SUGGESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="bg-[#eddece] hover:bg-[#7d654e]/20 text-[#7d654e] rounded-full px-3 py-1.5 text-xs transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
