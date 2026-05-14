"use client";

export default function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header shimmer */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="h-5 bg-gray-100 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-36" />
      </div>

      {/* Order cards shimmer */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-28" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-5 bg-gray-100 rounded w-5" />
            </div>
            <div className="mx-4 mb-3 border-t border-dashed border-gray-100" />
            <div className="px-4 flex flex-col gap-3">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3 bg-gray-100 rounded w-5/6 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="w-12 h-4 bg-gray-100 rounded shrink-0" />
                </div>
              ))}
            </div>
            <div className="mx-4 mt-4 mb-3 border-t border-gray-100" />
            <div className="px-4 pb-4 flex gap-2">
              <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
              <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}