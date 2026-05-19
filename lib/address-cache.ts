export type CachedAddress = {
  id: string;
  label: string | null;
  fullName: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
  createdAt: string;
};

const TTL_MS = 5 * 60 * 1000;

function key(phone: string): string {
  return `jeeva_addresses_${phone}`;
}

export function getCachedAddresses(phone: string): CachedAddress[] | null {
  if (typeof window === "undefined" || !phone) return null;
  try {
    const raw = sessionStorage.getItem(key(phone));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; list: CachedAddress[] };
    if (!parsed?.at || Date.now() - parsed.at > TTL_MS) return null;
    return parsed.list;
  } catch {
    return null;
  }
}

export function setCachedAddresses(phone: string, list: CachedAddress[]): void {
  if (typeof window === "undefined" || !phone) return;
  try {
    sessionStorage.setItem(
      key(phone),
      JSON.stringify({ at: Date.now(), list }),
    );
  } catch {}
}

export function clearCachedAddresses(phone?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (phone) {
      sessionStorage.removeItem(key(phone));
    } else {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith("jeeva_addresses_")) sessionStorage.removeItem(k);
      }
    }
  } catch {}
}
