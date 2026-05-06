import { getMinOrderValue } from "@/lib/settings";
import { saveStoreSettings } from "./actions";

export default async function AdminSettings() {
  const minOrder = await getMinOrderValue();

  return (
    <div className="px-4 py-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-[16px] font-bold text-gray-900">Store settings</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Controls that affect checkout for all customers.
        </p>

        <form action={saveStoreSettings} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-gray-700">
              Minimum order value (₹)
            </span>
            <input
              name="minOrderValue"
              type="number"
              min={0}
              step="1"
              defaultValue={minOrder}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <span className="text-[11px] text-gray-400">
              Set to 0 to disable. Customers can't checkout below this amount.
            </span>
          </label>

          <button
            type="submit"
            className="bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl active:scale-[0.98] transition-transform"
          >
            Save settings
          </button>
        </form>
      </div>
    </div>
  );
}
