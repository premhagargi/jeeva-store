export default function CategoriesLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* New category button */}
      <div className="h-12 bg-emerald-100 rounded-2xl" />

      {/* Category cards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}
