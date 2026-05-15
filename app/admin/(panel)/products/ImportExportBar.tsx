"use client";

import { useRef, useState } from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportExportBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleImport(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setMessage(`✗ ${json.error ?? "Import failed"}`);
      } else {
        setMessage(
          `✓ Created ${json.created}, updated ${json.updated}${json.errors?.length ? `, ${json.errors.length} errors` : ""}`,
        );
        router.refresh();
      }
    } catch (err) {
      setMessage(`✗ ${err instanceof Error ? err.message : "Import failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <a
          href="/api/admin/products/export"
          className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-[12px] font-bold py-2 rounded-xl"
        >
          <Download size={13} />
          Export CSV
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-[12px] font-bold py-2 rounded-xl disabled:opacity-60"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          Import CSV
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            e.target.value = "";
          }}
        />
      </div>
      {message && <p className="text-[11px] font-semibold text-gray-700">{message}</p>}
    </div>
  );
}
