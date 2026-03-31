export default function Loading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-40 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#e8dfd4] pb-3">
        {["w-24", "w-28", "w-24"].map((w, i) => (
          <div key={i} className={`h-8 ${w} bg-[#e8dfd4]/40 rounded-lg`} />
        ))}
      </div>

      {/* List items */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8dfd4] rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#e8dfd4]/40 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-[#e8dfd4]/40 rounded-lg mb-1.5" />
                <div className="h-3 w-28 bg-[#e8dfd4]/30 rounded-lg" />
              </div>
              <div className="h-3 w-20 bg-[#e8dfd4]/30 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
