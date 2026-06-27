export default function OrderDetailLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-20 bg-gray-100 rounded" />

      {/* Order info card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-16 bg-gray-100 rounded-lg" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-12 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-12 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="h-2.5 w-14 bg-gray-100 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Items card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="h-4 w-12 bg-gray-100 rounded mb-3" />
        <div className="flex flex-col divide-y divide-gray-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2">
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-32 bg-gray-100 rounded" />
                <div className="h-2.5 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-10 bg-gray-100 rounded" />
            </div>
          ))}
          <div className="flex justify-between mt-1">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Status history */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-100 mt-1.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="h-2.5 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
