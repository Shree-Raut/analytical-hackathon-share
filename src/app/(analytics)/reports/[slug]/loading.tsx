export default function Loading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-56 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-32 bg-[#e8dfd4]/30 rounded-lg" />
        ))}
        <div className="h-9 w-24 bg-[#e8dfd4]/40 rounded-lg ml-auto" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-4 shadow-sm">
            <div className="h-3 w-20 bg-[#e8dfd4]/30 rounded-lg mb-2" />
            <div className="h-6 w-16 bg-[#e8dfd4]/40 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-[#e8dfd4] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 bg-[#f7f3ef] border-b border-[#e8dfd4]">
          {["w-32", "w-24", "w-20", "w-28", "w-20", "w-16"].map((w, i) => (
            <div key={i} className={`h-3 ${w} bg-[#e8dfd4]/40 rounded`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e8dfd4]/50 last:border-0">
            {["w-28", "w-20", "w-16", "w-24", "w-16", "w-12"].map((w, j) => (
              <div key={j} className={`h-3.5 ${w} bg-[#e8dfd4]/30 rounded`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
