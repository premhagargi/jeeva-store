export default function AdminLoading() {
  return (
    <div className="px-4 py-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
      </div>

      <div className="h-10 w-full bg-gray-100 rounded-xl mb-4" />

      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="h-3 bg-gray-100 rounded w-3/5" />
              <div className="h-3 bg-gray-100 rounded w-2/5" />
            </div>
            <div className="h-3 w-12 bg-gray-100 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
