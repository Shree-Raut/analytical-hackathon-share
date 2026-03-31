export default function Loading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-48 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-80 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Section 1: Alert Rules */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-28 bg-[#e8dfd4]/40 rounded-lg" />
          <div className="h-8 w-28 bg-[#e8dfd4]/30 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[#e8dfd4]/40 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-[#e8dfd4]/40 rounded-lg mb-1.5" />
                  <div className="h-3 w-56 bg-[#e8dfd4]/30 rounded-lg" />
                </div>
                <div className="h-6 w-12 bg-[#e8dfd4]/30 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-20 bg-[#e8dfd4]/20 rounded" />
                <div className="h-3 w-24 bg-[#e8dfd4]/20 rounded" />
                <div className="h-3 w-16 bg-[#e8dfd4]/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Contextual Thresholds */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-[#e8dfd4]/40 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="h-4 w-36 bg-[#e8dfd4]/40 rounded-lg mb-1.5" />
                  <div className="h-3 w-48 bg-[#e8dfd4]/30 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-14 bg-emerald-100/50 rounded" />
                  <div className="h-6 w-14 bg-amber-100/50 rounded" />
                  <div className="h-6 w-14 bg-red-100/50 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
