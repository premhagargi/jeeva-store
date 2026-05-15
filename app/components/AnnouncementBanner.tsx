import { getStorefrontSettings } from "@/lib/settings";

export default async function AnnouncementBanner() {
  const s = await getStorefrontSettings();
  if (!s.announcement && s.storeOpen) return null;
  return (
    <div
      className={`px-4 py-1.5 text-center text-[11px] font-bold ${
        !s.storeOpen
          ? "bg-red-500 text-white"
          : "bg-emerald-500 text-white"
      }`}
    >
      {!s.storeOpen ? "⏸ Store is currently closed" : s.announcement}
    </div>
  );
}
