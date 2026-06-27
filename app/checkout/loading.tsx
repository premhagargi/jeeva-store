export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-9 h-9 bg-gray-100 rounded-xl" />
        <div className="h-5 w-20 bg-gray-100 rounded" />
      </div>

      <div className="px-4 py-4 flex flex-col gap-4 pb-32">
        {/* Contact card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-11 bg-gray-50 rounded-xl border border-gray-100" />
          <div className="h-11 bg-gray-50 rounded-xl border border-gray-100" />
        </div>

        {/* Address card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-50 rounded-xl border border-gray-100" />
          <div className="h-16 bg-gray-50 rounded-xl border border-gray-100" />
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="h-4 w-28 bg-gray-100 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-40 bg-gray-100 rounded" />
              <div className="h-3 w-10 bg-gray-100 rounded" />
            </div>
          ))}
          <div className="border-t border-dashed border-gray-100 pt-2 flex justify-between">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Payment card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4">
        <div className="h-16 bg-emerald-200 rounded-2xl" />
      </div>
    </div>
  );
}
