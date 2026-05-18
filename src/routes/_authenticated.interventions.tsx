import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Plus, Mail, Users as UsersIcon, MessageSquare, Phone, NotebookPen } from "lucide-react";
import { PageHeader, Section, Pill, Kpi } from "@/components/ui-kit";
import { useWorkspace } from "@/stores/workspace";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/interventions")({
  component: InterventionsPage,
});

type Intervention = {
  id: string;
  student_code: string;
  kind: string;
  notes: string | null;
  created_at: string;
};

const KINDS = [
  { value: "email", label: "Email reminder", icon: Mail },
  { value: "tutoring", label: "Tutoring scheduled", icon: UsersIcon },
  { value: "meeting", label: "Faculty meeting", icon: MessageSquare },
  { value: "call", label: "Phone call home", icon: Phone },
  { value: "note", label: "Note", icon: NotebookPen },
] as const;

function InterventionsPage() {
  const students = useWorkspace((s) => s.students);
  const atRisk = useMemo(() => students.filter((s) => s.risk_level === "High"), [students]);
  const [history, setHistory] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("interventions")
      .select("id,student_code,kind,notes,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setHistory((data as Intervention[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const byStudent = useMemo(() => {
    const m = new Map<string, Intervention[]>();
    for (const h of history) {
      const arr = m.get(h.student_code) ?? [];
      arr.push(h);
      m.set(h.student_code, arr);
    }
    return m;
  }, [history]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Mitigation & Interventions"
        description="High-risk students from the latest pipeline run. Log interventions to keep an audit trail."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="At-risk students" value={atRisk.length} tone="danger" icon={ShieldAlert} />
        <Kpi label="Interventions logged" value={history.length} tone="primary" />
        <Kpi label="Last 7 days" value={history.filter((h) => Date.now() - new Date(h.created_at).getTime() < 7 * 86_400_000).length} />
      </div>

      <Section title="High-risk cohort" description={loading ? "Loading…" : `${atRisk.length} students need attention`}>
        {atRisk.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No high-risk students right now. Roster is healthy.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {atRisk.slice(0, 100).map((s) => {
              const hist = byStudent.get(s.id) ?? [];
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link to="/students/$studentId" params={{ studentId: s.id }} className="font-medium hover:text-primary">
                      {s.name}
                    </Link>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {s.id} · {s.class} · attendance {s.attendance}% · score {s.final_score}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{hist.length} logged</span>
                    <LogDialog studentCode={s.id} studentName={s.name} onSaved={refresh} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Recent activity">
        {history.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No interventions logged yet.</div>
        ) : (
          <ul className="space-y-2">
            {history.slice(0, 30).map((h) => {
              const k = KINDS.find((x) => x.value === h.kind);
              return (
                <li key={h.id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-background p-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Pill tone="primary">{k?.label ?? h.kind}</Pill>
                      <Link to="/students/$studentId" params={{ studentId: h.student_code }} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                        {h.student_code}
                      </Link>
                    </div>
                    {h.notes && <p className="mt-1 text-sm">{h.notes}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

function LogDialog({ studentCode, studentName, onSaved }: { studentCode: string; studentName: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("email");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("interventions")
      .insert({ student_code: studentCode, kind, notes });
    setSaving(false);
    if (error) {
      console.error(error);
      alert(`Failed to save: ${error.message}`);
      return;
    }
    setNotes("");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3 w-3" /> Log
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log intervention for {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Sent automated reminder; followed up by phone."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => setOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}