export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-pulse">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gray-100" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-100 rounded w-32 mb-1.5" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
      </div>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-2"
          >
            <div className="aspect-square w-full rounded-xl bg-gray-100" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-7 bg-gray-100 rounded-xl w-full mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
