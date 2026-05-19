"use client";

export function AddressCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-start gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-52 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-40" />
      </div>
      <div className="h-5 w-12 bg-gray-100 rounded" />
    </div>
  );
}

export function AddressListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 bg-gray-50 p-3"
        >
          <div className="flex items-start gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 mt-1" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-48 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
