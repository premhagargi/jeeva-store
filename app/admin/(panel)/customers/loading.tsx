export default function CustomersLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Search bar */}
      <div className="flex flex-col gap-2">
        <div className="h-11 bg-white rounded-xl border border-gray-100 shadow-sm" />
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
          <div className="h-7 w-20 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Customer cards */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-36 bg-gray-100 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
