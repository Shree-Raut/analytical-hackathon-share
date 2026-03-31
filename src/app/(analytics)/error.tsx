"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-8 max-w-5xl">
      <div className="rounded-xl border border-[#e8dfd4] bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1510] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[#7d654e] mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#7d654e] text-white rounded-lg text-sm hover:bg-[#7d654e]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
