# Rebrand to Intellecta + Splash + Full Visual Overhaul

## 1. Branding & assets
- Save the uploaded logo to `src/assets/intellecta-logo.png` and `public/icon-512.png` (replace favicon/PWA icon).
- Replace every "ScholarSense" / "Academic Analytics" string with **Intellecta** across:
  - `src/components/WorkspaceShell.tsx` (sidebar header, topbar breadcrumb, page title fallback)
  - `index.html` (`<title>`, meta description, OG/Twitter tags, apple-mobile-web-app-title)
  - `public/manifest.json` (name, short_name, description, theme color)
  - `src/routes/__root.tsx` (404 link target)
  - Any remaining mentions in dashboard / reports / footer copy.

## 2. Splash screen replaces the landing page
- Delete `src/routes/index.tsx`'s landing content. Replace with a splash route:
  - Centered Intellecta logo on a clean background matching the logo's navy + silver.
  - Logo "blinks" (opacity pulse, ~1s cycle, 2 cycles ≈ 2s total) with a subtle scale.
  - After ~2.2s, auto-navigate to `/dashboard` via `router.navigate`.
  - Also clickable to skip.
- Remove the `loc.pathname === "/"` early-return in `WorkspaceShell` so the splash renders fullscreen without the sidebar (use a flag or render splash component directly inside the route file with no shell wrapping — simplest: keep the early-return but render the splash inside index.tsx).
- Update `manifest.json` `start_url` stays `/dashboard` so PWA opens past splash; web visitors hit `/` → splash → dashboard.

## 3. New color system (replace current indigo/slate palette)
Adopt a **Navy + Silver + Soft Gold** palette inspired by the logo:
- Primary: deep navy `oklch(0.32 0.10 255)` (matches logo blue)
- Accent / chart highlight: warm gold `oklch(0.78 0.13 85)`
- Secondary surfaces: warm silver/cool gray
- Success/warn/danger retuned to harmonise (teal / amber / coral)
- Update both `:root` and `.dark` blocks in `src/styles.css`, plus all 5 chart tokens.
- Add a `--gradient-hero` and `--shadow-elegant` token used by cards.

## 4. Layout pattern overhaul
Switch from "sidebar + topbar + flat cards" to a **bento-style workspace**:
- Sidebar: convert to a slim **icon rail** (always collapsed look, expands on hover) with a top logo badge. Group labels become tooltips.
- Topbar: replace breadcrumb with a large page title + subtitle row, plus a right-side action cluster.
- Page content: introduce a reusable `<BentoGrid>` and `<BentoTile>` (in `src/components/ui-kit.tsx`) that pages opt into. Tiles have rounded-2xl corners, soft elevation, and varied column spans (`col-span-2`, `row-span-2`) for visual rhythm — applied first on Dashboard, EDA, Evaluate, Reports.
- Cards get `rounded-2xl`, hairline borders, gradient header strips for KPI tiles.

## 5. Chart redesign (type + library style)
Currently the app mixes hand-rolled SVG bar charts and Recharts. Standardise on **Recharts with a fresh visual language** and swap chart types where it improves the story:
- Dashboard grade distribution: hand-rolled `<svg>` bars → **Recharts AreaChart** with gradient fill.
- EDA correlations: bar list → **horizontal Recharts BarChart** with diverging colors (gold for positive, coral for negative).
- EDA studytime/absences/failures averages: bar → **Recharts ComposedChart** (bars + line for count).
- Pass-rate-by-group: bar → **Recharts RadialBarChart**.
- Evaluate confusion matrix: keep matrix but restyle as a heatmap grid using token colors.
- Evaluate feature importance: vertical bars → **Recharts horizontal BarChart with rounded caps**.
- Predict explanation: keep but recolor.
- Reports: add a sparkline strip (Recharts LineChart) above each section.
All charts share a `chartTheme.ts` helper for axis/grid/tooltip styling using design tokens.

## 6. Naming alignment
The requested labels already match the current sidebar groups/items. Action: confirm and keep:
- Group **Data Pipeline** → rename to **Data** (cleaner). Items: Data Collection, Cleaning, EDA, Feature Engineering.
- Group **Modeling** → items: Evaluate, Predict, Batch Predict.
- Group **Administration** → item: Model Operations.
- Group **Output** → item: Reports.
- Update `TITLES` map and any in-page H1s to match.

## 7. Cleanup
- Remove unused `<spline-viewer>` script tag from `index.html` (only the landing used it).
- Remove `src/components/AppShell.tsx` if no longer referenced.
- Drop the `GraduationCap` lucide icon header in favour of an `<img src={logo} />`.

## Technical notes
- All color changes go through `src/styles.css` tokens — no hex literals in components.
- Splash uses CSS keyframes (no animation library needed).
- Recharts is already a dependency (used in existing routes), no new installs.
- Route tree unchanged — `/` still exists, just renders splash.
- Keep Supabase wiring untouched.

## Out of scope
- No backend/data changes.
- No auth.
- No new pages.
