export default function Loading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-36 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-80 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-[#e8dfd4]/40 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-28 bg-[#e8dfd4]/40 rounded-lg mb-2" />
                <div className="h-5 w-16 bg-[#e8dfd4]/30 rounded-full" />
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-2 h-2 bg-[#e8dfd4]/40 rounded-full" />
                  <div className="h-3 w-20 bg-[#e8dfd4]/30 rounded-lg" />
                </div>
              </div>
              <div className="w-8 h-8 bg-[#e8dfd4]/30 rounded-lg" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-[#e8dfd4]/30 rounded" />
                  <div className="h-3 w-20 bg-[#e8dfd4]/30 rounded" />
                </div>
              ))}
            </div>
            <div className="h-8 w-full bg-[#e8dfd4]/30 rounded-lg" />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="h-2 w-20 bg-[#e8dfd4]/20 rounded" />
                <div className="h-2 w-8 bg-[#e8dfd4]/20 rounded" />
              </div>
              <div className="h-1.5 w-full bg-[#e8dfd4]/20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="rounded-xl border border-[#e8dfd4] bg-white px-5 py-3 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-[#e8dfd4]/40 rounded-lg" />
          <div className="w-px h-3 bg-[#e8dfd4]" />
          <div className="h-4 w-20 bg-[#e8dfd4]/30 rounded-lg" />
          <div className="w-px h-3 bg-[#e8dfd4]" />
          <div className="h-4 w-24 bg-[#e8dfd4]/30 rounded-lg" />
        </div>
      </div>

      {/* Exchange section */}
      <div className="mb-4">
        <div className="h-6 w-44 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-[#e8dfd4]/30 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-[#e8dfd4]/40 rounded-lg mb-3" />
            <div className="h-4 w-24 bg-[#e8dfd4]/40 rounded-lg mb-1.5" />
            <div className="h-3 w-full bg-[#e8dfd4]/20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
