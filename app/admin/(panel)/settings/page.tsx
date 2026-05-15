import { getStorefrontSettings } from "@/lib/settings";
import { saveStoreSettings } from "./actions";

export default async function AdminSettings() {
  const s = await getStorefrontSettings();

  return (
    <div className="px-4 py-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-[16px] font-bold text-gray-900">Store settings</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Controls that affect checkout and the storefront.
        </p>

        <form action={saveStoreSettings} className="mt-5 flex flex-col gap-5">
          <label className="flex items-center justify-between gap-3 bg-emerald-50 rounded-xl px-3 py-2.5">
            <div>
              <p className="text-[13px] font-bold text-emerald-800">Store open</p>
              <p className="text-[11px] text-emerald-700/70">
                When off, customers see a "closed" banner and can't checkout.
              </p>
            </div>
            <input
              type="checkbox"
              name="storeOpen"
              defaultChecked={s.storeOpen}
              className="w-5 h-5 accent-emerald-500"
            />
          </label>

          <Field label="Minimum order value (₹)" hint="Set to 0 to disable.">
            <input
              name="minOrderValue"
              type="number"
              min={0}
              step="1"
              defaultValue={s.minOrderValue}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery fee (₹)" hint="Flat fee added at checkout.">
              <input
                name="deliveryFee"
                type="number"
                min={0}
                step="1"
                defaultValue={s.deliveryFee}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
              />
            </Field>
            <Field label="Free delivery above (₹)" hint="0 = always charge.">
              <input
                name="freeDeliveryThreshold"
                type="number"
                min={0}
                step="1"
                defaultValue={s.freeDeliveryThreshold}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
              />
            </Field>
          </div>

          <Field label="Store hours" hint="Shown on storefront.">
            <input
              name="storeHours"
              defaultValue={s.storeHours ?? ""}
              placeholder="e.g. 8 AM – 9 PM, daily"
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
            />
          </Field>

          <Field label="Announcement banner" hint="Shown at the top of the storefront. Leave empty to hide.">
            <textarea
              name="announcement"
              defaultValue={s.announcement ?? ""}
              rows={2}
              placeholder="e.g. Special offer: 10% off on rice this week!"
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] outline-none resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact phone">
              <input
                name="contactPhone"
                defaultValue={s.contactPhone ?? ""}
                placeholder="+91 9876543210"
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
              />
            </Field>
            <Field label="Contact email">
              <input
                name="contactEmail"
                type="email"
                defaultValue={s.contactEmail ?? ""}
                placeholder="hello@jeeva.com"
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
              />
            </Field>
          </div>

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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}
