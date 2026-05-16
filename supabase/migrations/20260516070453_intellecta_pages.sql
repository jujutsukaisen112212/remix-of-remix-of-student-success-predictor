-- Interventions / Risk mitigation
CREATE TABLE public.interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('email','tutoring','meeting','note','call')),
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text DEFAULT 'faculty'
);
CREATE INDEX interventions_student_code_idx ON public.interventions(student_code);
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read interventions" ON public.interventions FOR SELECT USING (true);
CREATE POLICY "Public insert interventions" ON public.interventions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete interventions" ON public.interventions FOR DELETE USING (true);

CREATE TABLE public.alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  metric text NOT NULL CHECK (metric IN ('predicted_score','attendance','study_hours','previous_marks','final_score')),
  operator text NOT NULL CHECK (operator IN ('lt','gt','lte','gte')),
  threshold numeric NOT NULL,
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app','email')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read alert_rules" ON public.alert_rules FOR SELECT USING (true);
CREATE POLICY "Public insert alert_rules" ON public.alert_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update alert_rules" ON public.alert_rules FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete alert_rules" ON public.alert_rules FOR DELETE USING (true);

CREATE TABLE public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  rule_name text,
  student_code text NOT NULL,
  student_name text,
  metric text,
  value numeric,
  triggered_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX alert_events_triggered_idx ON public.alert_events(triggered_at DESC);
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read alert_events" ON public.alert_events FOR SELECT USING (true);
CREATE POLICY "Public insert alert_events" ON public.alert_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete alert_events" ON public.alert_events FOR DELETE USING (true);
