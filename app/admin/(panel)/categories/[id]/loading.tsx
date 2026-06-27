export default function CategoryDetailLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-24 bg-gray-100 rounded" />

      {/* Category header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Products section header */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-8 w-28 bg-emerald-100 rounded-xl" />
      </div>

      {/* Product rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
          </div>
          <div className="h-3 w-12 bg-gray-100 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}
