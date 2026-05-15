import { getStorefrontSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export default async function AdminSettings() {
  const s = await getStorefrontSettings();

  return (
    <div className="px-4 py-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-[16px] font-bold text-gray-900">Store settings</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Controls that affect checkout and the storefront.
        </p>
        <SettingsForm initial={s} />
      </div>
    </div>
  );
}
