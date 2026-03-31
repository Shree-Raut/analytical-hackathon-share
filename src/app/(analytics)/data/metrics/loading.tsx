export default function Loading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-48 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Search bar */}
      <div className="h-10 w-full bg-[#e8dfd4]/30 rounded-lg mb-4" />

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["w-16", "w-24", "w-20", "w-20", "w-24"].map((w, i) => (
          <div key={i} className={`h-8 ${w} bg-[#e8dfd4]/40 rounded-lg`} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-[#e8dfd4] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 bg-[#f7f3ef] border-b border-[#e8dfd4]">
          {["w-36", "w-20", "w-24", "w-20", "w-16", "w-16"].map((w, i) => (
            <div key={i} className={`h-3 ${w} bg-[#e8dfd4]/40 rounded`} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e8dfd4]/50 last:border-0">
            {["w-32", "w-16", "w-20", "w-16", "w-12", "w-12"].map((w, j) => (
              <div key={j} className={`h-3.5 ${w} bg-[#e8dfd4]/30 rounded`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
