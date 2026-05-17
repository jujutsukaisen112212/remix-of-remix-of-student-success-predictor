// Prediction helpers — pure functions kept side-effect free so they can be
// reused by UI components and (future) server functions.

export type RiskLevel = "Low" | "Medium" | "High";

export interface StudentSignals {
  attendance: number;        // 0-100
  studyHours: number;        // hours/day
  previousMarks: number;     // 0-100
  assignmentsCompleted: number; // 0-100
  sleepHours: number;        // hours
  participation?: "Low" | "Medium" | "High";
}

export interface PredictionResult {
  predictedScore: number;
  riskLevel: RiskLevel;
  weakSubjects: string[];
  attendanceAnalysis: string;
  recommendations: string[];
  recommendedStudyHours: number;
  performanceTrend: string;
  confidenceScore: number;
}

export function calculateRisk(predictedScore: number, attendance: number): RiskLevel {
  if (predictedScore < 50 || attendance < 60) return "High";
  if (predictedScore < 70 || attendance < 80) return "Medium";
  return "Low";
}

export function detectWeakSubjects(signals: StudentSignals): string[] {
  // Without per-subject inputs we infer from overall signals. UIs can override.
  const weak: string[] = [];
  if (signals.previousMarks < 60) weak.push("Mathematics");
  if (signals.studyHours < 2) weak.push("Physics");
  if (signals.assignmentsCompleted < 60) weak.push("English");
  return weak;
}

export function generateRecommendations(signals: StudentSignals, predictedScore: number): string[] {
  const recs: string[] = [];
  if (signals.studyHours < 3) recs.push(`Increase study hours by ${Math.max(1, 3 - Math.round(signals.studyHours))} hours/day`);
  if (signals.attendance < 85) recs.push("Maintain attendance above 85%");
  if (signals.assignmentsCompleted < 80) recs.push("Complete pending assignments");
  if (signals.sleepHours < 6) recs.push("Aim for 7-8 hours of sleep");
  if (predictedScore < 60) recs.push("Schedule weekly mentor check-ins");
  if (!recs.length) recs.push("Maintain current routine — performance looks healthy");
  return recs;
}

export function calculateConfidence(signals: StudentSignals): number {
  // Confidence rises with consistent inputs (no zeros, no extremes).
  const values = [signals.attendance, signals.studyHours * 10, signals.previousMarks, signals.assignmentsCompleted];
  const complete = values.filter((v) => v > 0).length / values.length;
  const stability = 1 - Math.min(1, Math.abs(signals.sleepHours - 7) / 7);
  return Math.round((0.6 * complete + 0.4 * stability) * 100);
}

export function predict(signals: StudentSignals): PredictionResult {
  // Lightweight heuristic — real model arrives via FastAPI later.
  const base =
    0.35 * signals.previousMarks +
    0.20 * signals.attendance +
    0.15 * Math.min(100, signals.studyHours * 12) +
    0.15 * signals.assignmentsCompleted +
    0.10 * Math.min(100, signals.sleepHours * 12) +
    0.05 * (signals.participation === "High" ? 100 : signals.participation === "Medium" ? 70 : 40);
  const predictedScore = Math.round(Math.min(100, Math.max(0, base)));
  const riskLevel = calculateRisk(predictedScore, signals.attendance);
  const attendanceAnalysis = signals.attendance < 75
    ? "Attendance below recommended threshold"
    : signals.attendance < 90
      ? "Attendance acceptable but improvable"
      : "Strong attendance";
  const trend = predictedScore >= signals.previousMarks + 5
    ? "Improving"
    : predictedScore <= signals.previousMarks - 5
      ? "Declining"
      : "Stable";
  return {
    predictedScore,
    riskLevel,
    weakSubjects: detectWeakSubjects(signals),
    attendanceAnalysis,
    recommendations: generateRecommendations(signals, predictedScore),
    recommendedStudyHours: Math.max(2, Math.min(6, Math.round(6 - predictedScore / 25))),
    performanceTrend: trend,
    confidenceScore: calculateConfidence(signals),
  };
}
