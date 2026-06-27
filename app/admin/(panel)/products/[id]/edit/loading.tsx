export default function EditProductLoading() {
  return (
    <div className="px-4 py-6 flex flex-col gap-5 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-24 bg-gray-100 rounded" />

      {/* Image preview */}
      <div className="h-40 bg-gray-100 rounded-2xl" />

      {/* Input fields */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-11 bg-white rounded-xl border border-gray-100" />
        </div>
      ))}

      {/* Save button */}
      <div className="h-12 bg-emerald-100 rounded-2xl" />

      {/* Danger zone */}
      <div className="h-14 bg-red-50 rounded-2xl border border-red-100" />
    </div>
  );
}
