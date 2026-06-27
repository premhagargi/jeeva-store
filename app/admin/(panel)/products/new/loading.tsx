export default function NewProductLoading() {
  return (
    <div className="px-4 py-6 flex flex-col gap-5 animate-pulse">
      {/* Section header */}
      <div className="h-5 w-32 bg-gray-100 rounded" />

      {/* Input fields */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-11 bg-white rounded-xl border border-gray-100" />
        </div>
      ))}

      {/* Image upload area */}
      <div className="h-32 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200" />

      {/* Submit button */}
      <div className="h-12 bg-emerald-100 rounded-2xl" />
    </div>
  );
}
