"use client";

export default function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 animate-pulse">
      {/* Header shimmer */}
      <div className="bg-white px-4 pt-6 pb-5 border-b border-gray-100">
        <div className="h-6 bg-gray-100 rounded w-20 mb-4" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-200" />
          <div className="flex-1">
            <div className="h-5 bg-gray-100 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-48" />
          </div>
          <div className="h-8 bg-gray-100 rounded w-16" />
        </div>
      </div>

      {/* Menu sections shimmer */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {[...Array(3)].map((_, si) => (
          <div key={si}>
            <div className="h-3 bg-gray-100 rounded w-24 mb-2 ml-1" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {[...Array(si === 0 ? 3 : si === 1 ? 1 : 3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-24 mt-1" />
                  </div>
                  <div className="w-4 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}