import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { PageHeader, Section, Pill } from "@/components/ui-kit";
import { useWorkspace } from "@/stores/workspace";

export const Route = createFileRoute("/_authenticated/students")({
  component: StudentsPage,
});

const CLASSES = ["All", "CSE-A", "CSE-B", "ECE-A", "ECE-B", "ME-A", "IT-A", "IT-B"];
const RISKS = ["All", "Low", "Medium", "High"];

function StudentsPage() {
  const students = useWorkspace((s) => s.students);
  const [q, setQ] = useState("");
  const [klass, setKlass] = useState("All");
  const [risk, setRisk] = useState("All");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return students
      .filter((s) => (klass === "All" || s.class === klass))
      .filter((s) => (risk === "All" || s.risk_level === risk))
      .filter((s) => !term || s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term))
      .slice(0, 500);
  }, [students, q, klass, risk]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Roster"
        description="Searchable directory of every student. Click any row to see their full profile and AI-generated risk factors."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or ID"
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select value={klass} onChange={(e) => setKlass(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          {RISKS.map((r) => <option key={r}>{r === "All" ? "All risks" : `${r} risk`}</option>)}
        </select>
        <div className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{rows.length}</span> students
        </div>
      </div>

      <Section>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2 text-left">Student</th>
                <th className="px-3 py-2 text-left">Class</th>
                <th className="px-3 py-2 text-right">Attendance</th>
                <th className="px-3 py-2 text-right">Final score</th>
                <th className="px-3 py-2 text-left">Risk</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-5 py-2">
                    <Link to="/_authenticated/students/$studentId" params={{ studentId: s.id }} className="font-medium hover:text-primary">
                      {s.name}
                    </Link>
                    <div className="font-mono text-[11px] text-muted-foreground">{s.id}</div>
                  </td>
                  <td className="px-3 py-2">{s.class}</td>
                  <td className="px-3 py-2 text-right font-mono">{s.attendance}%</td>
                  <td className="px-3 py-2 text-right font-mono">{s.final_score}</td>
                  <td className="px-3 py-2">
                    <Pill tone={s.risk_level === "High" ? "danger" : s.risk_level === "Medium" ? "warning" : "success"}>
                      {s.risk_level}
                    </Pill>
                  </td>
                  <td className="px-5 py-2 text-right">
                    <Link to="/_authenticated/students/$studentId" params={{ studentId: s.id }} className="text-muted-foreground hover:text-foreground">
                      <ChevronRight className="inline h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No students match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}