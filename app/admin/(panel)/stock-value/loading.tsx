export default function StockValueLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-20 bg-gray-100 rounded" />

      {/* Total banner */}
      <div className="bg-teal-50 rounded-2xl p-5 flex flex-col gap-2">
        <div className="h-3 w-28 bg-teal-100 rounded" />
        <div className="h-8 w-40 bg-teal-100 rounded" />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-1.5">
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-5 w-3/4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Category cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="h-2 bg-gray-100 rounded-full" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex justify-between py-1">
              <div className="h-3 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
