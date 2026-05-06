"use client";

const PHONE_KEY = "jeeva-customer-phone";

export function getStoredPhone(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PHONE_KEY);
}

export function setStoredPhone(phone: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PHONE_KEY, phone);
  }
}

export function clearStoredPhone() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PHONE_KEY);
  }
}
