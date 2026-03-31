"use client";

export default function FastPassError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#faf7f4] p-8">
      <div className="max-w-3xl mx-auto bg-white border border-red-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-700">Fast Pass encountered an error</h2>
        <p className="mt-2 text-sm text-[#7d654e]">
          {error.message || "Unexpected error. Please retry."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 px-4 py-2 bg-[#7d654e] text-white rounded-lg hover:bg-[#6b5642]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
