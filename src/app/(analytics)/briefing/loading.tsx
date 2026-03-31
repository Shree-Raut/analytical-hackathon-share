export default function Loading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-8 w-56 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* KPI cards grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-[#e8dfd4]/40 rounded-lg" />
              <div className="h-4 w-12 bg-[#e8dfd4]/30 rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-[#e8dfd4]/40 rounded-lg mb-1" />
            <div className="h-3 w-28 bg-[#e8dfd4]/30 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Portfolio summary bar */}
      <div className="flex items-center justify-between bg-white border border-[#e8dfd4] rounded-xl px-6 py-4 shadow-sm mb-10">
        <div className="flex items-center gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#e8dfd4]/40 rounded-full" />
              <div className="h-4 w-10 bg-[#e8dfd4]/40 rounded-lg" />
              <div className="h-4 w-16 bg-[#e8dfd4]/30 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="h-4 w-36 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Alert cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-44 bg-[#e8dfd4]/40 rounded-lg" />
          <div className="h-4 w-24 bg-[#e8dfd4]/30 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-[#e8dfd4]/40 rounded-full" />
                <div className="h-4 w-32 bg-[#e8dfd4]/40 rounded-lg" />
                <div className="h-4 w-20 bg-[#e8dfd4]/30 rounded-lg ml-auto" />
              </div>
              <div className="h-3 w-full bg-[#e8dfd4]/20 rounded-lg mb-2" />
              <div className="h-3 w-3/4 bg-[#e8dfd4]/20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
