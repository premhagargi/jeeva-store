export default function SettingsLoading() {
  return (
    <div className="px-4 py-4 animate-pulse">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="h-3 w-56 bg-gray-100 rounded" />
        </div>

        {/* Settings fields */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-11 bg-gray-50 rounded-xl border border-gray-100" />
          </div>
        ))}

        {/* Save button */}
        <div className="h-12 bg-emerald-100 rounded-2xl" />
      </div>
    </div>
  );
}
