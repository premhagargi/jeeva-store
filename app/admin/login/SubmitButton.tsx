"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}
