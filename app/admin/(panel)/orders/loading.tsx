export default function OrdersLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Search bar */}
      <div className="h-11 bg-white rounded-xl border border-gray-100 shadow-sm" />

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-hidden">
        {[64, 56, 80, 112, 72, 72].map((w, i) => (
          <div key={i} className="shrink-0 h-8 bg-gray-100 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Order cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3 w-12 bg-gray-100 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="px-4 pb-3 flex flex-col gap-1.5">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
          <div className="border-t border-gray-100 p-3">
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
