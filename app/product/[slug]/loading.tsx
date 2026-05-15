export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gray-100" />
        <div className="h-3.5 bg-gray-100 rounded w-32" />
      </div>

      <div className="bg-white px-6 py-8 flex items-center justify-center">
        <div className="w-full aspect-square max-w-xs rounded-3xl bg-gray-100" />
      </div>

      <div className="bg-white mt-2 px-4 py-5 border-t border-gray-100 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-6 bg-gray-100 rounded w-1/3 mt-4" />
      </div>

      <div className="bg-white mt-2 px-4 py-5 border-t border-gray-100">
        <div className="h-4 bg-gray-100 rounded w-36 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1 w-full h-7 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
