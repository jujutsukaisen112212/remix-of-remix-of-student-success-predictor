import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Download, Smartphone } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallButton() {
  const loc = useLocation();
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvt(null);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  // Hide on splash so it doesn't fight the centered logo
  if (loc.pathname === "/") return null;

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const canPrompt = !!evt;

  if (!canPrompt && !isIos) return null;

  const onClick = async () => {
    if (evt) {
      await evt.prompt();
      await evt.userChoice;
      setEvt(null);
    } else if (isIos) {
      setShowIosHint(true);
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        aria-label="Install Intellecta"
        className="fixed right-4 top-4 z-[70] inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg hover:brightness-110"
      >
        <Download className="h-3.5 w-3.5" />
        Install app
      </button>
      {showIosHint && (
        <div
          role="dialog"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setShowIosHint(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-mono text-sm font-semibold tracking-wide">Install on iPhone / iPad</h3>
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Tap the <strong>Share</strong> button in Safari.</li>
              <li>Choose <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top-right corner.</li>
            </ol>
            <button
              onClick={() => setShowIosHint(false)}
              className="mt-4 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}