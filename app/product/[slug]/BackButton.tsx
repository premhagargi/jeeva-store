"use client";

import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      onClick={() => history.back()}
      className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
    >
      <ChevronLeft size={20} className="text-gray-700" />
    </button>
  );
}
