import { Suspense } from "react";
import CategorySections from "./components/CategorySections";

function CategorySkeleton() {
  return (
    <div className="px-4 py-4 bg-white animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-36 bg-gray-100 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square rounded-2xl bg-gray-100" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-2.5 w-3/4 bg-gray-100 rounded -mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <Suspense fallback={<CategorySkeleton />}>
        <CategorySections />
      </Suspense>
    </main>
  );
}
