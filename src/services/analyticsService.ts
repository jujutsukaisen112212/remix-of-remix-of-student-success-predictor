import { supabase } from "@/integrations/supabase/client";

export interface CohortStats {
  totalStudents: number;
  averageScore: number;
  averageAttendance: number;
  passPercentage: number;
  weakCount: number;
  topPerformers: { name: string; score: number }[];
}

const PASS_THRESHOLD = 50;
const WEAK_THRESHOLD = 50;

export async function fetchCohortStats(): Promise<CohortStats> {
  const { data, error } = await supabase
    .from("students")
    .select("name, final_score, attendance")
    .limit(1000);
  if (error) throw error;
  const rows = data ?? [];
  const totalStudents = rows.length;
  if (!totalStudents) {
    return { totalStudents: 0, averageScore: 0, averageAttendance: 0, passPercentage: 0, weakCount: 0, topPerformers: [] };
  }
  const averageScore = rows.reduce((s, r) => s + Number(r.final_score ?? 0), 0) / totalStudents;
  const averageAttendance = rows.reduce((s, r) => s + Number(r.attendance ?? 0), 0) / totalStudents;
  const passing = rows.filter((r) => Number(r.final_score ?? 0) >= PASS_THRESHOLD).length;
  const weakCount = rows.filter((r) => Number(r.final_score ?? 0) < WEAK_THRESHOLD).length;
  const topPerformers = [...rows]
    .sort((a, b) => Number(b.final_score ?? 0) - Number(a.final_score ?? 0))
    .slice(0, 5)
    .map((r) => ({ name: r.name, score: Number(r.final_score ?? 0) }));
  return {
    totalStudents,
    averageScore: Math.round(averageScore * 10) / 10,
    averageAttendance: Math.round(averageAttendance * 10) / 10,
    passPercentage: Math.round((passing / totalStudents) * 100),
    weakCount,
    topPerformers,
  };
}
