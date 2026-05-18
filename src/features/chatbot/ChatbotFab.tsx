import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "@tanstack/react-router";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import mascot from "@/assets/chatbot-mascot.png";

const STORAGE_KEY = "intellecta.chatbot.pos";

export function ChatbotFab() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 24, y: 24 };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {/* ignore */}
    return { x: 24, y: 24 };
  });
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch {/* ignore */}
  }, [pos]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragState.current.moved = true;
    const nextX = Math.max(8, Math.min(window.innerWidth - 72, dragState.current.origX - dx));
    const nextY = Math.max(8, Math.min(window.innerHeight - 72, dragState.current.origY - dy));
    setPos({ x: nextX, y: nextY });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const moved = dragState.current?.moved;
    dragState.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (!moved) setOpen((v) => !v);
  };

  // Hide on splash and auth screens
  if (loc.pathname === "/" || loc.pathname === "/auth") return null;
  if (!mounted) return null;

  const node = (
    <>
      <button
        aria-label="Open AI assistant"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ left: pos.x, bottom: pos.y }}
        className={cn(
          "fixed z-[60] flex h-16 w-16 items-center justify-center rounded-full",
          "bg-white shadow-xl ring-2 ring-primary/30 transition-transform hover:scale-110 active:scale-95",
          "touch-none select-none cursor-grab active:cursor-grabbing",
        )}
      >
        <img src={mascot} alt="AI Assistant" className="h-14 w-14 select-none object-contain" draggable={false} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ left: pos.x, bottom: pos.y + 80 }}
          className="fixed z-[60] w-[min(90vw,320px)] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-mono text-sm font-semibold tracking-wide">AI Assistant</h3>
            </div>
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            This feature is currently under development.
          </p>
          <p className="mt-1 text-sm font-medium">Coming Soon 🚀</p>
          <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Future features</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>Performance guidance</li>
              <li>Study suggestions</li>
              <li>Prediction explanations</li>
              <li>AI support assistant</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(node, document.body);
}
