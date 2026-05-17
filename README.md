# Student Success Prediction System

A friendly little workspace for teachers, mentors, and academic staff who want to stop guessing which students are slipping through the cracks. It pulls together attendance, study hours, marks, and performance trends, and turns them into something you can actually act on — risk flags, cohort views, and predictions you can defend in a staff meeting.

The app is branded as **Intellecta** in the UI, but at its heart it's a student performance analysis tool: see how a cohort is doing, drill into one student, log an intervention, and ship a report.

## What it does

- **Student management** — searchable roster, individual student profiles, contact and academic details in one place.
- **Performance prediction** — predict a student's likely score from their current signals and surface the *why* alongside the *what*.
- **Analytics dashboard** — live KPIs for the whole cohort: average performance, at-risk counts, distribution, trends over time.
- **Student reports** — exportable per-student reports you can share with parents, advisors, or the student themselves.
- **Visualization** — charts, distributions, and risk heatmaps that make a 200-row spreadsheet actually readable.

## Tech stack

- **React** + **TypeScript** for the UI
- **Vite** for the dev server and build
- **Tailwind CSS** for styling
- **Supabase** for the database, auth, and realtime sync
- **TanStack Router** for type-safe routing

## Getting started

```bash
bun install
bun dev
```

Then open the URL Vite prints (usually `http://localhost:8080`). The app boots into a short splash and drops you on the dashboard.

## Project layout

```
src/
  routes/        file-based pages (dashboard, students, predict, reports, ...)
  components/    shared UI, sidebar shell, charts, dialogs
  integrations/  supabase client + generated types
  data/          sample/seed data
  lib/           analytics + helpers
  stores/        workspace state
```

## Notes

- Supabase is wired up via `src/integrations/supabase/client.ts`. Add your env vars and you're off.
- The app is installable on Android and iOS — open it on a phone and use *Add to Home Screen*.
- The whole thing is meant to be hackable. Add a route file under `src/routes/`, the sidebar will pick it up.
