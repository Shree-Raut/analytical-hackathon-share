export default function Loading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-28 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#e8dfd4] pb-3">
        {["w-16", "w-20", "w-20", "w-20"].map((w, i) => (
          <div key={i} className={`h-8 ${w} bg-[#e8dfd4]/40 rounded-lg`} />
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-[#e8dfd4]/40 rounded-full" />
              <div className="h-4 w-40 bg-[#e8dfd4]/40 rounded-lg" />
              <div className="h-5 w-16 bg-[#e8dfd4]/30 rounded-full ml-auto" />
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-3 w-24 bg-[#e8dfd4]/30 rounded-lg" />
              <div className="h-3 w-28 bg-[#e8dfd4]/30 rounded-lg" />
              <div className="h-3 w-20 bg-[#e8dfd4]/30 rounded-lg" />
            </div>
            <div className="h-3 w-full bg-[#e8dfd4]/20 rounded-lg mb-1.5" />
            <div className="h-3 w-2/3 bg-[#e8dfd4]/20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
