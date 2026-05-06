import { getMinOrderValue } from "@/lib/settings";
import CartView from "./CartView";

export default async function CartPage() {
  const minOrderValue = await getMinOrderValue();
  return <CartView minOrderValue={minOrderValue} />;
}
