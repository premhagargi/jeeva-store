"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14;

function dismissKey(adminScope: boolean): string {
  return adminScope ? "jeeva_install_dismissed_admin" : "jeeva_install_dismissed_store";
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsAdmin(window.location.pathname.startsWith("/admin"));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS-only flag
      window.navigator.standalone === true;
    if (standalone) return;

    const dismissedAt = Number(localStorage.getItem(dismissKey(window.location.pathname.startsWith("/admin"))) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function onInstalled() {
      setVisible(false);
      setDeferred(null);
      localStorage.setItem(dismissKey(window.location.pathname.startsWith("/admin")), String(Date.now()));
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome !== "accepted") {
        localStorage.setItem(dismissKey(window.location.pathname.startsWith("/admin")), String(Date.now()));
      }
    } catch {}
    setDeferred(null);
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(dismissKey(window.location.pathname.startsWith("/admin")), String(Date.now()));
    setVisible(false);
  }

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900">
            {isAdmin ? "Install Jeeva Admin" : "Install Jeeva Mart"}
          </p>
          <p className="text-[11px] text-gray-500 leading-tight">
            {isAdmin
              ? "Get order alerts even when closed."
              : "Faster access and offline support."}
          </p>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[12px] font-bold shrink-0"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-gray-400 shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
