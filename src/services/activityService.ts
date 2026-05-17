import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "upload" | "prediction" | "profile" | "attendance" | "system";

export async function logActivity(input: {
  action: string;
  activityType?: ActivityType;
  userLabel?: string;
  details?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("activity_logs").insert({
    action: input.action,
    activity_type: input.activityType ?? "system",
    user_label: input.userLabel ?? "Faculty",
    details: (input.details ?? {}) as never,
  });
  if (error) console.warn("[activity] log failed:", error.message);
}

export async function fetchRecentActivity(limit = 20) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
