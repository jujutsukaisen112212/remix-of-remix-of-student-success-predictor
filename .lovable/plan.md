## 1. Chatbot — robot mascot, draggable anywhere on screen

**Visual swap**

- Copy the uploaded robot image to `src/assets/chatbot-mascot.png`.
- In `src/features/chatbot/ChatbotFab.tsx`, replace the `MessageCircle` icon with an `<img>` of the mascot. Drop the gradient background so the mascot reads as the button itself; keep the soft shadow and ring for affordance. Size ~64×64.

**Why it only moves "inside the nav bar" today**
The FAB is rendered inside `WorkspaceShell`'s flex row that also contains the `<Sidebar>`. Even though the button is `position: fixed`, on mobile the sidebar's `<Sheet>` overlay (used by shadcn's `Sidebar` in `collapsible="offcanvas"` mode) creates a stacking/pointer-events context that captures drags once the sheet is open, and the FAB sits behind/inside it. The `pos.x`/`pos.y` clamp also uses `window.innerWidth` correctly, so the math is fine — the issue is mount location + z-index vs. the sidebar sheet.

**Fix**

- Move `<ChatbotFab />` out of `WorkspaceShell` and render it once at the app root (inside `RootComponent` in `src/routes/__root.tsx`, after `<WorkspaceShell />`). That removes it from the sidebar's stacking context entirely.
- Render it via a React Portal into `document.body` so nothing in the shell tree can clip it.
- Bump z-index to `z-[60]` (above the sidebar sheet which is `z-50`) and add `pointer-events: auto` on the button while leaving the wrapper transparent.
- Hide the FAB on the `/` splash and on `/auth` routes (simple `useLocation` check inside the component).
- Keep the existing `pointer-events` drag logic — it already supports touch and mouse, persists position to `localStorage`, and clamps to the viewport.

## 2. Auth screen between splash and dashboard

**Flow**

```text
/  (splash, 2.2s blinking logo)
        │
        ▼
/auth  (21st.dev sliding sign-in / sign-up panels)
        │ on successful sign-in / sign-up
        ▼
/dashboard  (and the rest of the app)
```

Per your choice, the splash always routes to `/auth` — even signed-in users see it briefly, and the auth screen offers a "Continue to dashboard" shortcut when a session already exists.

**Auth model**

- Email + password only (no profiles table, no roles, no Google).
- Disable "Confirm email" in the Supabase Auth settings so sign-up = immediate access (I'll call this out in chat; it's a one-click toggle in the dashboard).
- All existing routes get wrapped by a pathless `_authenticated` layout route so anything unauthenticated bounces to `/auth`. This is also what makes the locked-down RLS policies on `students`, `activity_logs`, `interventions`, `alerts`, etc. actually work.

**New files**

- `src/components/ui/auth-switch.tsx` — the 21st.dev sliding sign-in/sign-up component, ported to TypeScript and re-themed to Intellecta's navy/silver/gold palette (uses semantic tokens from `styles.css`, not raw colors). Lucide icons replace the emoji placeholders.
- `src/routes/auth.tsx` — wraps `AuthSwitch`, wires both forms to `supabase.auth.signInWithPassword` / `supabase.auth.signUp`, shows inline error toasts, and on success calls `router.navigate({ to: "/dashboard" })`. If a session already exists on mount, shows a "Continue as &nbsp;" button instead of auto-redirecting (matches your "always show auth screen" choice).
- `src/routes/_authenticated.tsx` — pathless layout route with `beforeLoad` that checks `supabase.auth.getSession()` and redirects to `/auth` if missing. Renders `<Outlet />`.
- `src/hooks/use-auth.ts` — small hook that subscribes to `supabase.auth.onAuthStateChange` and exposes `{ session, user, signOut }`. Used by the topbar to show the user's email and a sign-out button.

**Edits to existing files**

- `src/routes/index.tsx` (splash): change the post-timeout target from `/dashboard` to `/auth`.
- All current route files under `src/routes/` (except `index.tsx` and `auth.tsx`) get renamed into the `_authenticated/` folder so they inherit the guard. TanStack's file-based router picks this up via `routeTree.gen.ts` automatically — no manual route table edits.
  - `dashboard.tsx → _authenticated/dashboard.tsx`
  - `students.tsx`, `students.$studentId.tsx`, `interventions.tsx`, `alerts.tsx`, `eda.tsx`, `data.upload.tsx`, `data.clean.tsx`, `features.tsx`, `model.evaluate.tsx`, `model.train.tsx`, `predict.tsx`, `predict.batch.tsx`, `admin.models.tsx`, `reports.tsx` — same move.
- `src/components/WorkspaceShell.tsx`: add the user email + sign-out button to the topbar; remove `<ChatbotFab />` (now mounted at root).
- `src/routes/__root.tsx`: wire `onAuthStateChange` once (invalidates router so loaders re-run on sign-in/out); mount `<ChatbotFab />` here.

**No new tables.** The previous migration already locked `students`, `activity_logs`, `interventions`, `alert_rules`, and `alert_events` to `authenticated` — adding the auth screen is what makes those policies usable. No schema changes in this plan.

## What stays the same

- All charts, pages, sidebar nav labels, splash visuals, color tokens, PWA manifest.
- The existing security memory and RLS policies.
- The FastAPI scaffold under `backend/`.

## Out of scope (call out if you want them next)

- Password reset / forgot password page.
- Google / GitHub social sign-in.
- Per-user data scoping (right now any signed-in user sees every student; we'd need a `created_by` column and policy rewrite to isolate cohorts).
- Admin-only gating on Model Operations and Administration pages (requires a `user_roles` table you opted out of).
- add an logout button with logout functionality at the bottom of the alert page in the navigation bar 
- add an button as continue at the user authentication at the bottom and when the user clicks that continue without login flow them directly to the project that is dashboard 
- the splash screen logo is displayed as square type change it to round logo 
- the pwa for android device and ios is not working make sure it is working properly 
- display the install button on the screen on the top right corner on the screen and when the user clicks on it they shoudl be able to download the project locally that is the pwa   
  
