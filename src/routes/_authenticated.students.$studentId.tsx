import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { PageHeader, Section, Pill, Kpi } from "@/components/ui-kit";
import { useWorkspace } from "@/stores/workspace";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/students/$studentId")({
  component: StudentProfile,
});

type Intervention = {
  id: string;
  kind: string;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

function StudentProfile() {
  const { studentId } = useParams({ from: "/students/$studentId" });
  const students = useWorkspace((s) => s.students);
  const student = students.find((s) => s.id === studentId);
  const [history, setHistory] = useState<Intervention[]>([]);

  useEffect(() => {
    if (!studentId) return;
    (supabase as any)
      .from("interventions")
      .select("id,kind,notes,created_at,created_by")
      .eq("student_code", studentId)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Intervention[] | null }) => setHistory(data ?? []));
  }, [studentId]);

  if (!student) {
    return (
      <div className="space-y-6">
        <PageHeader title="Student not found" />
        <Link to="/_authenticated/students" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to roster
        </Link>
      </div>
    );
  }

  const factors = riskFactors(student);

  return (
    <div className="space-y-6">
      <Link to="/_authenticated/students" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Roster
      </Link>
      <PageHeader
        title={student.name}
        description={`${student.id} · ${student.class} · Semester ${student.semester} · ${student.gender === "F" ? "Female" : "Male"}`}
        actions={
          <Pill tone={student.risk_level === "High" ? "danger" : student.risk_level === "Medium" ? "warning" : "success"}>
            {student.risk_level} risk
          </Pill>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Final score" value={student.final_score} tone="primary" />
        <Kpi label="Attendance" value={`${student.attendance}%`} tone={student.attendance < 75 ? "danger" : "success"} />
        <Kpi label="Study hours / day" value={student.study_hours} />
        <Kpi label="Engagement" value={student.engagement_score} tone="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Performance metrics">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Previous marks" value={`${student.previous_marks}/100`} />
            <Metric label="Assignments" value={`${student.assignments_completed}/12`} />
            <Metric label="Sleep hours" value={`${student.sleep_hours} h`} />
            <Metric label="Internet (non-academic)" value={`${student.internet_usage} h/day`} />
            <Metric label="Participation" value={student.participation} />
            <Metric label="Study category" value={student.study_category} />
            <Metric label="Performance index" value={student.performance_index} />
          </dl>
        </Section>

        <Section title="AI-generated risk factors" description="Auto-derived from the latest pipeline run.">
          {factors.length === 0 ? (
            <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>No risk factors detected. Student is on track.</span>
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {factors.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  {f.severity === "high"
                    ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                    : <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-warning" />}
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Intervention history" description="Logged via the Interventions page.">
        {history.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No interventions logged yet. <Link to="/_authenticated/interventions" className="text-primary hover:underline">Log one →</Link>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <Pill tone="primary">{h.kind}</Pill>
                  <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                </div>
                {h.notes && <p className="mt-1.5 text-sm text-foreground">{h.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

function riskFactors(s: { attendance: number; previous_marks: number; study_hours: number; assignments_completed: number; internet_usage: number; participation: string; sleep_hours: number }) {
  const out: { text: string; severity: "high" | "medium" }[] = [];
  if (s.attendance < 70) out.push({ text: `Attendance is only ${s.attendance}% — below the 70% threshold.`, severity: "high" });
  else if (s.attendance < 85) out.push({ text: `Attendance at ${s.attendance}% is below the target of 85%.`, severity: "medium" });
  if (s.previous_marks < 50) out.push({ text: `Previous marks (${s.previous_marks}) signal academic struggle.`, severity: "high" });
  if (s.study_hours < 2) out.push({ text: `Daily study time is only ${s.study_hours}h — well below the 5h target.`, severity: "high" });
  if (s.assignments_completed < 8) out.push({ text: `Only ${s.assignments_completed} of 12 assignments submitted.`, severity: "medium" });
  if (s.internet_usage > 5) out.push({ text: `Non-academic screen time of ${s.internet_usage}h/day is excessive.`, severity: "medium" });
  if (s.participation === "Low") out.push({ text: `Low classroom participation reduces predicted score by ~4 points.`, severity: "medium" });
  if (s.sleep_hours < 6) out.push({ text: `Sleep at ${s.sleep_hours}h/night impairs cognitive performance.`, severity: "medium" });
  return out;
}