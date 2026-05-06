"use client";

import { useSyncExternalStore } from "react";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  quantityValue: number | null;
  price: number;
  qty: number;
  emoji: string;
  bg: string;
  imageUrl: string | null;
}

const STORAGE_KEY = "jeeva-cart";

let state: CartLine[] = [];
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const EMPTY: CartLine[] = [];
function getSnapshot() {
  return state;
}
function getServerSnapshot() {
  return EMPTY;
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToCart(line: Omit<CartLine, "qty">) {
  const existing = state.find((l) => l.productId === line.productId);
  if (existing) {
    state = state.map((l) =>
      l.productId === line.productId ? { ...l, qty: l.qty + 1 } : l,
    );
  } else {
    state = [...state, { ...line, qty: 1 }];
  }
  persist();
  emit();
}

export function increment(productId: string) {
  state = state.map((l) =>
    l.productId === productId ? { ...l, qty: l.qty + 1 } : l,
  );
  persist();
  emit();
}

export function decrement(productId: string) {
  state = state
    .map((l) =>
      l.productId === productId ? { ...l, qty: l.qty - 1 } : l,
    )
    .filter((l) => l.qty > 0);
  persist();
  emit();
}

export function removeLine(productId: string) {
  state = state.filter((l) => l.productId !== productId);
  persist();
  emit();
}

export function clearCart() {
  state = [];
  persist();
  emit();
}

export function addLines(lines: CartLine[]) {
  for (const line of lines) {
    const existing = state.find((l) => l.productId === line.productId);
    if (existing) {
      state = state.map((l) =>
        l.productId === line.productId ? { ...l, qty: l.qty + line.qty } : l,
      );
    } else {
      state = [...state, line];
    }
  }
  persist();
  emit();
}

export function getQty(productId: string): number {
  return state.find((l) => l.productId === productId)?.qty ?? 0;
}
