export default function BillLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Type toggle */}
      <div className="h-12 bg-white rounded-2xl border border-gray-100" />

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
          <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 bg-gray-100 rounded" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 bg-gray-100 rounded w-3/5" />
                <div className="h-2.5 bg-gray-100 rounded w-2/5" />
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
