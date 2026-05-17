import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  body: string;
  type: "attendance" | "prediction" | "system" | "student";
  unread: boolean;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("students")
        .select("id, name, attendance, final_score")
        .limit(1000);
      if (!mounted || !data) return;
      const notices: Notice[] = [];
      const low = data.filter((s) => Number(s.attendance) < 75);
      if (low.length) notices.push({
        id: "att-low",
        title: `${low.length} students below 75% attendance`,
        body: "Review the cohort roster to schedule interventions.",
        type: "attendance",
        unread: true,
      });
      const risky = data.filter((s) => Number(s.final_score) < 50);
      if (risky.length >= 3) notices.push({
        id: "risk-cluster",
        title: `${risky.length} high-risk students detected`,
        body: "Predicted scores fell below the passing threshold.",
        type: "prediction",
        unread: true,
      });
      notices.push({
        id: "sys-online",
        title: "Realtime sync active",
        body: "Live updates from Supabase enabled.",
        type: "system",
        unread: false,
      });
      setItems(notices);
    })();
    return () => { mounted = false; };
  }, []);

  const unread = items.filter((i) => i.unread).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl">
          <div className="border-b border-border px-2 py-1.5">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">All clear — no alerts.</li>
            )}
            {items.map((n) => (
              <li key={n.id} className="rounded-md px-3 py-2 hover:bg-accent">
                <div className="flex items-start gap-2">
                  <span className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    n.type === "attendance" && "bg-amber-500",
                    n.type === "prediction" && "bg-red-500",
                    n.type === "system" && "bg-emerald-500",
                    n.type === "student" && "bg-blue-500",
                  )} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
