## 1. Navigation cleanup (WorkspaceShell.tsx)

- Remove **Cleaning** and **Feature Engineering** from the sidebar `NAV` (routes/files remain so existing links don't break, just hidden).
- Rename labels + `TITLES`:
  - `Data Collection` → **Data Portal**
  - `EDA` → **Insights & Trends**
- Reorganize sidebar groups to include the three new pages (see §3).

## 2. Fix "Not Found" on `/dashboard`, `/predict`, etc.

Symptom: hard-refresh or deep link on any non-root route renders TanStack's bare "Not Found" string.

Root cause: `src/routes/__root.tsx` (and/or router config) is missing `notFoundComponent` / `defaultNotFoundComponent`, AND the splash-screen logic in `src/routes/index.tsx` is likely throwing a `notFound()` or returning empty during SSR hydration, which TanStack's fuzzy not-found mode bubbles up to root. Will:

- Add `notFoundComponent` to `__root.tsx` and `defaultNotFoundComponent` + `defaultErrorComponent` in `src/router.tsx`.
- Audit `index.tsx` splash: ensure the `useEffect` redirect runs only client-side and the component always returns valid JSX during SSR (no conditional `null` returns that produce empty trees).
- Confirm every new route file declares `createFileRoute("/exact-path")` matching its filename.

## 3. Three new Supabase-backed pages

### 3a. Student Roster / Cohort View
- Route: `src/routes/students.tsx` (list) + `src/routes/students.$studentId.tsx` (profile).
- List: searchable/filterable table over existing `students` table (reuse `DataTable`), columns: name, class, attendance, final_score, risk_level. Row click → profile.
- Profile: full metric breakdown + AI-generated risk factors (reuse `lib/explain.ts` `ExplainPanel`).
- Sidebar group: **Students** → Roster.

### 3b. Risk Mitigation / Interventions
- Route: `src/routes/interventions.tsx`.
- Lists students where `risk_level = 'High'` from `students` table.
- New Supabase table `interventions` (migration): `id uuid pk`, `student_code text fk→students.student_code`, `kind text` (`email`, `tutoring`, `meeting`, `note`), `notes text`, `created_at timestamptz default now()`, `created_by text`.
- RLS enabled; policies allow authenticated read/insert (no auth wired yet → permissive policies with TODO comment, matching existing `students` pattern).
- UI: per-student card with intervention history + "Log intervention" dialog (kind select + notes textarea) → inserts row, optimistic update.
- Sidebar group: **Risk** → Interventions.

### 3c. Automated Reports / Alerts
- Route: `src/routes/alerts.tsx`.
- New Supabase table `alert_rules`: `id`, `name text`, `metric text` (`predicted_score`, `attendance`, `study_hours`), `operator text` (`lt`,`gt`,`lte`,`gte`), `threshold numeric`, `channel text` (`in_app`, `email`), `enabled bool default true`, `created_at`.
- Companion table `alert_events`: `id`, `rule_id fk`, `student_code`, `value numeric`, `triggered_at`.
- UI: list rules with toggle/edit/delete, "New rule" dialog, plus a "Recent alerts" feed reading `alert_events` (joined to student name). Evaluation runs client-side on rule save against current hydrated students; trigger inserts go to `alert_events`. (Server-side cron evaluation is out of scope for this turn; noted as follow-up.)
- Sidebar group: **Output** → Reports, **Alerts**.

All three pages use the existing `@/integrations/supabase/client` browser client. Types regenerate after migration.

## 4. Replace Predict page animation

- In `src/routes/predict.tsx`, replace the current loading/prediction animation with the supplied tapping-hand markup.
- Move the CSS into `src/components/tap-loader.css` (using ASCII class names `tap-hand`, `tap-finger`, `tap-palm`, `tap-thumb` — emoji class names break Tailwind/PostCSS parsing in some builds). Markup mirrors the structure exactly (4 fingers + palm + thumb).
- Add a small `<TapLoader />` component in `src/components/TapLoader.tsx` and import the CSS once.

## 5. Pipeline automation (Supabase-side)

Move cleaning + feature engineering out of the UI:

- Migration adds:
  - `students` columns (if missing): `risk_level text generated always as (...) stored` OR a `BEFORE INSERT/UPDATE` trigger `students_engineer()` that fills `risk_level`, normalizes nulls (coalesce attendance/study_hours to sane defaults), and clamps ranges.
  - Function `public.engineer_student()` (plpgsql) — mirrors `data/students.ts::engineer` logic.
  - Trigger `students_before_write` on insert/update.
- Frontend `useHydrateWorkspace` already reads cleaned rows; remove client-side `engineer()` call once trigger lands (keep as fallback for offline/sample data).
- Realtime: enable Supabase Realtime on `students`, `interventions`, `alert_events`; subscribe in `stores/workspace.tsx` so dashboard/cohort/alerts pages update live.

## Technical notes

- Migrations are append-only files under `supabase/migrations/` (timestamp-prefixed). Will create one migration covering: `interventions`, `alert_rules`, `alert_events`, trigger function, realtime publication.
- All new tables get `ALTER TABLE … ENABLE ROW LEVEL SECURITY` + permissive `FOR ALL TO public USING (true)` policies (matching current `students` posture) with a `-- TODO: tighten when auth lands` comment.
- After migration, `src/integrations/supabase/types.ts` is regenerated automatically.
- Routes added to file-based routing; `routeTree.gen.ts` regenerates on dev.
- No changes to color tokens, logo, or splash screen.

## Out of scope

- Authentication / user accounts (interventions `created_by` stored as plain text for now).
- Server-side cron for alert evaluation (client-side trigger only this turn).
- Email/SMS delivery for alerts (channel stored, delivery noted as follow-up).
