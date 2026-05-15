"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2 } from "lucide-react";
import {
  getGalleryUploadSignature,
  addProductImage,
  removeProductImageById,
  updateProductImageAlt,
} from "./galleryActions";
import { optimizeCld } from "@/lib/cloudinary-optimize";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

interface Props {
  productId: string;
  images: GalleryImage[];
}

export default function Gallery({ productId, images }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Image only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5MB");
      return;
    }
    setUploading(true);
    try {
      const sig = await getGalleryUploadSignature(productId);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("public_id", sig.publicId);
      fd.append("signature", sig.signature);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const json = await res.json();
      if (!res.ok || !json.secure_url) {
        throw new Error(json?.error?.message ?? "Upload failed");
      }
      await addProductImage(productId, json.secure_url, json.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold text-gray-900">Image gallery</p>
        <button
          type="button"
          disabled={uploading || pending}
          onClick={() => inputRef.current?.click()}
          className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Add image
        </button>
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
      </div>
      {images.length === 0 ? (
        <p className="text-[12px] text-gray-400">
          No additional images yet. The main image is set on the products list.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="flex flex-col gap-1.5">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={optimizeCld(img.url, { width: 200 })}
                  alt={img.altText ?? ""}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Remove this image?")) return;
                    startTransition(() => removeProductImageById(img.id));
                  }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center"
                >
                  <Trash2 size={11} />
                </button>
              </div>
              <input
                defaultValue={img.altText ?? ""}
                placeholder="Alt text"
                onBlur={(e) =>
                  startTransition(() => updateProductImageAlt(img.id, e.target.value))
                }
                className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-[11px] outline-none"
              />
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
