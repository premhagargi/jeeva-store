"use client";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-36 animate-pulse">
      {/* Header shimmer */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded" />
          <div className="h-5 bg-gray-100 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-12 ml-auto" />
        </div>
      </div>

      {/* Delivery info shimmer */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div>
            <div className="h-3 bg-gray-100 rounded w-40 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-52" />
          </div>
        </div>
      </div>

      {/* Cart items shimmer */}
      <div className="px-4">
        <div className="bg-white rounded-2xl px-4 shadow-sm border border-gray-100 divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="w-16 h-5 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Bill summary shimmer */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <div className="h-4 bg-gray-100 rounded w-28 mb-3" />
          <div className="flex justify-between mb-2">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
          <div className="flex justify-between mb-2">
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-8" />
          </div>
          <div className="h-px bg-gray-200 my-1" />
          <div className="flex justify-between">
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-14" />
          </div>
        </div>
      </div>

      {/* Bottom button shimmer */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-50">
        <div className="h-12 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}