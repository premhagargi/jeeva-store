"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { getUploadSignature, saveProductImage, removeProductImage } from "./actions";
import { optimizeCld } from "@/lib/cloudinary-optimize";

interface Props {
  productId: string;
  productName: string;
  imageUrl: string | null;
  fallbackEmoji: string;
  fallbackBg: string;
}

export default function ImageUpload({
  productId,
  productName,
  imageUrl,
  fallbackEmoji,
  fallbackBg,
}: Props) {
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, startRemove] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const sig = await getUploadSignature(productId);

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", String(sig.timestamp));
      form.append("public_id", sig.publicId);
      form.append("signature", sig.signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      const json = await res.json();
      if (!res.ok || !json.secure_url) {
        throw new Error(json?.error?.message ?? "Upload failed");
      }

      await saveProductImage(productId, json.secure_url, json.public_id);
      setCurrentUrl(json.secure_url);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    startRemove(async () => {
      try {
        await removeProductImage(productId);
        setCurrentUrl(null);
      } catch (err: any) {
        setError(err?.message ?? "Remove failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-3xl shrink-0 relative ${
          currentUrl ? "bg-gray-100" : fallbackBg
        }`}
      >
        {currentUrl ? (
          <Image
            src={optimizeCld(currentUrl, { width: 96 })}
            alt={productName}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          fallbackEmoji
        )}
        {(uploading || removing) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 size={18} className="text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={uploading || removing}
            onClick={() => inputRef.current?.click()}
            className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 disabled:opacity-50"
          >
            <Upload size={12} />
            {currentUrl ? "Replace" : "Upload"}
          </button>
          {currentUrl && (
            <button
              type="button"
              disabled={uploading || removing}
              onClick={handleRemove}
              className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
      </div>
    </div>
  );
}
