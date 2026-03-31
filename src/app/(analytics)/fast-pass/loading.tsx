export default function FastPassLoading() {
  return (
    <div className="min-h-screen bg-[#faf7f4] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-[#e8dfd4] rounded" />
          <div className="h-24 w-full bg-[#e8dfd4] rounded-xl" />
          <div className="h-96 w-full bg-[#e8dfd4] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
