"use client";

export default function ShimmerCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col">
      {/* Image area shimmer */}
      <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2" />
      {/* Title shimmer */}
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      {/* Unit shimmer */}
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
      {/* Price + button row shimmer */}
      <div className="flex items-center justify-between mt-2">
        <div className="h-5 bg-gray-100 rounded w-1/4" />
        <div className="h-7 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

export function ShimmerCardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse px-4 pb-4">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
  );
}