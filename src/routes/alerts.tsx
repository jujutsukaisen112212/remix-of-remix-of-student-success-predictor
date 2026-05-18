import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { PageHeader, Section, Pill, Kpi } from "@/components/ui-kit";
import { useWorkspace } from "@/stores/workspace";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});

type Rule = {
  id: string;
  name: string;
  metric: string;
  operator: "lt" | "gt" | "lte" | "gte";
  threshold: number;
  channel: string;
  enabled: boolean;
};

type AlertEvent = {
  id: string;
  rule_name: string | null;
  student_code: string;
  student_name: string | null;
  metric: string | null;
  value: number | null;
  triggered_at: string;
};

const METRICS = [
  { value: "predicted_score", label: "Predicted score", from: (s: any) => s.final_score },
  { value: "final_score", label: "Final score", from: (s: any) => s.final_score },
  { value: "attendance", label: "Attendance %", from: (s: any) => s.attendance },
  { value: "study_hours", label: "Study hours / day", from: (s: any) => s.study_hours },
  { value: "previous_marks", label: "Previous marks", from: (s: any) => s.previous_marks },
] as const;

const OPS = [
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
] as const;

function check(value: number, op: Rule["operator"], threshold: number) {
  switch (op) {
    case "lt": return value < threshold;
    case "lte": return value <= threshold;
    case "gt": return value > threshold;
    case "gte": return value >= threshold;
  }
}

function AlertsPage() {
  const students = useWorkspace((s) => s.students);
  const [rules, setRules] = useState<Rule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [r, e] = await Promise.all([
      (supabase as any).from("alert_rules").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("alert_events").select("*").order("triggered_at", { ascending: false }).limit(50),
    ]);
    setRules((r.data as Rule[]) ?? []);
    setEvents((e.data as AlertEvent[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function toggle(rule: Rule) {
    await (supabase as any).from("alert_rules").update({ enabled: !rule.enabled }).eq("id", rule.id);
    refresh();
  }

  async function remove(rule: Rule) {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    await (supabase as any).from("alert_rules").delete().eq("id", rule.id);
    refresh();
  }

  async function evaluateNow() {
    const enabled = rules.filter((r) => r.enabled);
    if (!enabled.length) {
      alert("No enabled rules to evaluate.");
      return;
    }
    const inserts: Omit<AlertEvent, "id" | "triggered_at">[] = [];
    for (const r of enabled) {
      const metric = METRICS.find((m) => m.value === r.metric);
      if (!metric) continue;
      for (const s of students) {
        const v = Number(metric.from(s));
        if (Number.isFinite(v) && check(v, r.operator, Number(r.threshold))) {
          inserts.push({
            rule_name: r.name,
            student_code: s.id,
            student_name: s.name,
            metric: r.metric,
            value: v,
          });
        }
      }
    }
    if (!inserts.length) {
      alert("Rules evaluated — no students triggered.");
      return;
    }
    const batch = inserts.slice(0, 200); // cap
    const { error } = await (supabase as any).from("alert_events").insert(
      batch.map((b, i) => ({ ...b, rule_id: enabled.find((r) => r.name === b.rule_name)?.id ?? null }))
    );
    if (error) alert(`Failed: ${error.message}`);
    else alert(`${batch.length} alert(s) generated.`);
    refresh();
  }

  const activeCount = useMemo(() => rules.filter((r) => r.enabled).length, [rules]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Alerts"
        description="Configure thresholds that trigger faculty notifications. Evaluation runs against the current cohort."
        actions={
          <>
            <button onClick={evaluateNow} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">
              Evaluate now
            </button>
            <NewRuleDialog onCreated={refresh} />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Active rules" value={activeCount} tone="primary" icon={BellRing} />
        <Kpi label="Total rules" value={rules.length} />
        <Kpi label="Alerts (recent)" value={events.length} tone="warning" />
      </div>

      <Section title="Rules" description={loading ? "Loading…" : `${rules.length} configured`}>
        {rules.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No rules yet. Create one to start tracking thresholds.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {rules.map((r) => {
              const metric = METRICS.find((m) => m.value === r.metric);
              const op = OPS.find((o) => o.value === r.operator);
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.name}</span>
                      <Pill tone={r.enabled ? "success" : "neutral"}>{r.enabled ? "On" : "Off"}</Pill>
                      <Pill tone="primary">{r.channel}</Pill>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {metric?.label ?? r.metric} {op?.label} {r.threshold}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(r)} className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent">
                      {r.enabled ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => remove(r)} className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Recent alerts" description="Last 50 triggered events">
        {events.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No alerts triggered yet.</div>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-background p-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone="warning">{e.rule_name ?? "rule"}</Pill>
                    <span className="font-medium">{e.student_name ?? e.student_code}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {e.metric} = {e.value}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{new Date(e.triggered_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function NewRuleDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [metric, setMetric] = useState<string>("predicted_score");
  const [operator, setOperator] = useState<Rule["operator"]>("lt");
  const [threshold, setThreshold] = useState<number>(40);
  const [channel, setChannel] = useState<string>("in_app");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { alert("Name required"); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("alert_rules").insert({
      name: name.trim(), metric, operator, threshold, channel, enabled: true,
    });
    setSaving(false);
    if (error) { alert(`Failed: ${error.message}`); return; }
    setName(""); setOpen(false); onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New rule
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New alert rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Predicted score critical"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Metric</label>
              <select value={metric} onChange={(e) => setMetric(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Operator</label>
              <select value={operator} onChange={(e) => setOperator(e.target.value as Rule["operator"])} className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                {OPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Threshold</label>
              <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Channel</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
              <option value="in_app">In-app</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => setOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving ? "Saving…" : "Create"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}