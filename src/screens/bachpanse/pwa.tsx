import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registers the service worker in production builds only (it would fight HMR in dev). */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* installability is optional; the app works without it */
    });
  });
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

/** A small "Install app" pill, shown only when the browser says the PWA is installable. */
export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!event) return null;
  return (
    <button
      onClick={async () => {
        await event.prompt();
        await event.userChoice;
        setEvent(null);
      }}
      className="fixed left-3 top-3 z-[60] flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[12px] font-extrabold text-primary-foreground shadow-lg"
      style={{ marginTop: "env(safe-area-inset-top)" }}
    >
      <Download className="h-3.5 w-3.5" /> Install app
    </button>
  );
}
