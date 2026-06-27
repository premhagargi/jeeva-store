"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl mb-4">😕</p>
      <p className="text-[16px] font-bold text-gray-900 mb-1">Something went wrong</p>
      <p className="text-[13px] text-gray-500 mb-6">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="bg-emerald-500 text-white font-semibold text-[14px] px-6 py-2.5 rounded-xl active:scale-[0.98] transition-transform"
      >
        Try again
      </button>
    </div>
  );
}
