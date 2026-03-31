export default function Loading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-40 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Search bar */}
      <div className="h-10 w-full bg-[#e8dfd4]/30 rounded-lg mb-4" />

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["w-16", "w-24", "w-20", "w-28", "w-20"].map((w, i) => (
          <div key={i} className={`h-8 ${w} bg-[#e8dfd4]/40 rounded-lg`} />
        ))}
      </div>

      {/* Report card grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#e8dfd4]/40 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[#e8dfd4]/40 rounded-lg mb-1.5" />
                <div className="h-3 w-20 bg-[#e8dfd4]/30 rounded-lg" />
              </div>
            </div>
            <div className="h-3 w-full bg-[#e8dfd4]/20 rounded-lg mb-1.5" />
            <div className="h-3 w-3/4 bg-[#e8dfd4]/20 rounded-lg mb-4" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-[#e8dfd4]/30 rounded-full" />
              <div className="h-5 w-14 bg-[#e8dfd4]/30 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
