"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
      <p className="text-[14px] font-bold text-gray-900 mb-1">Something went wrong</p>
      <p className="text-[12px] text-gray-400 mb-4 max-w-xs">
        {error.message ?? "An unexpected error occurred."}
        {error.digest && (
          <span className="block mt-1 font-mono text-[10px] text-gray-300">{error.digest}</span>
        )}
      </p>
      <button
        onClick={reset}
        className="bg-emerald-500 text-white font-semibold text-[13px] px-5 py-2 rounded-xl active:scale-[0.98] transition-transform"
      >
        Try again
      </button>
    </div>
  );
}
