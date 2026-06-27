"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center font-sans">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-[16px] font-bold text-gray-900 mb-1">Something went wrong</p>
        <p className="text-[13px] text-gray-500 mb-6">
          An unexpected error occurred. Please refresh the page.
        </p>
        <button
          onClick={reset}
          style={{ background: "#10b981", color: "#fff", fontWeight: 600, fontSize: 14, padding: "10px 24px", borderRadius: 12 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
