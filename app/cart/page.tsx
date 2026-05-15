import { getStorefrontSettings } from "@/lib/settings";
import CartView from "./CartView";

export default async function CartPage() {
  const s = await getStorefrontSettings();
  return (
    <CartView
      minOrderValue={s.minOrderValue}
      deliveryFee={s.deliveryFee}
      freeDeliveryThreshold={s.freeDeliveryThreshold}
      storeOpen={s.storeOpen}
    />
  );
}
