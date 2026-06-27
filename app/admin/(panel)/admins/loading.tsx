export default function AdminsLoading() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-pulse">
      {/* Add admin button */}
      <div className="h-12 bg-emerald-100 rounded-2xl" />

      {/* Admin rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="h-7 w-16 bg-gray-100 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}
