export default function Loading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-7 w-44 bg-[#e8dfd4]/40 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-[#e8dfd4]/30 rounded-lg" />
      </div>

      <div className="flex gap-6">
        {/* Folder sidebar */}
        <div className="w-48 shrink-0 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <div className="w-4 h-4 bg-[#e8dfd4]/40 rounded" />
              <div className={`h-4 ${i === 0 ? "w-20" : i === 1 ? "w-24" : i === 2 ? "w-16" : "w-20"} bg-[#e8dfd4]/40 rounded-lg`} />
              <div className="h-4 w-5 bg-[#e8dfd4]/30 rounded ml-auto" />
            </div>
          ))}
        </div>

        {/* Table area */}
        <div className="flex-1">
          <div className="bg-white border border-[#e8dfd4] rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-3 bg-[#f7f3ef] border-b border-[#e8dfd4]">
              {["w-40", "w-24", "w-20", "w-20", "w-16"].map((w, i) => (
                <div key={i} className={`h-3 ${w} bg-[#e8dfd4]/40 rounded`} />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e8dfd4]/50 last:border-0">
                {["w-36", "w-20", "w-16", "w-16", "w-12"].map((w, j) => (
                  <div key={j} className={`h-3.5 ${w} bg-[#e8dfd4]/30 rounded`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
