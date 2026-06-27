export default function AuditLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3 animate-pulse">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-hidden">
        {[36, 64, 72, 80, 56].map((w, i) => (
          <div key={i} className="shrink-0 h-8 bg-gray-100 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Count */}
      <div className="h-3 w-20 bg-gray-100 rounded" />

      {/* Log entries */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl px-3 py-2">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <div className="h-3.5 w-48 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded shrink-0" />
          </div>
          <div className="h-3 w-36 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}
