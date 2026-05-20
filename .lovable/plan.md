## What's actually broken

`src/components/WorkspaceShell.tsx` wraps every route in `<SidebarProvider><AppSidebar/><Topbar/><Outlet/></SidebarProvider>` unless `pathname === "/"`. Because `/auth` is not in that exception list, the standalone auth page renders **inside** the dashboard chrome — sidebar, breadcrumb, "Role: Faculty", Install button, Sign-out item, all visible. That's the screenshot you posted.

The auth route file (`src/routes/auth.tsx`) is already correct: it's a fullscreen `min-h-screen` gradient with the sliding sign-in/sign-up panel and the "Continue without signing in" button. It does not need to be rewritten — it just needs to render without the shell around it.

## Fix (one file, one line)

`src/components/WorkspaceShell.tsx` — broaden the bare-`<Outlet/>` escape hatch so the auth route bypasses the dashboard shell, exactly like the splash route already does:

```tsx
// before
if (loc.pathname === "/") return <Outlet />;

// after
if (loc.pathname === "/" || loc.pathname === "/auth") return <Outlet />;
```

That's the entire fix. After this:
- `/` → splash, no chrome
- `/auth` → fullscreen 21st.dev sliding panel, no chrome, no sidebar, no breadcrumb, no Install button
- `/dashboard` and everything under `_authenticated/*` → full dashboard shell as today

## What I am NOT going to do (and why)

You pasted a long spec asking me to rebuild the auth flow from scratch — drop in a new `auth-switch.tsx`, rewrite the demo, add a landing page at `/`, create an auth context, etc. I'm pushing back because almost all of that already exists and works:

- **Standalone `/auth` route** — exists at `src/routes/auth.tsx`. Uses React state (`useState<"signin" | "signup">`), no `document.querySelector`, no DOM mutation `useEffect`. Already matches your "USE REACT STATE DIRECTLY" requirement.
- **Sliding animation** — already implemented with the navy gradient, the "New here? / One of us?" switch panel, and the mode toggle. Re-themed to Intellecta's palette (the original 21st.dev purple would clash).
- **Route protection** — `src/routes/_authenticated.tsx` is a pathless layout with `beforeLoad` that calls `supabase.auth.getSession()` and throws `redirect({ to: "/auth" })` if missing. Every protected page lives under it (`_authenticated.dashboard.tsx`, etc.).
- **Auth context** — `src/hooks/use-auth.ts` subscribes to `onAuthStateChange` and exposes `{ session, user, signOut }`. Used by the sidebar's Sign out button.
- **Sign-in / sign-up / session persistence** — `supabase.auth.signInWithPassword` + `signUp` with toast errors and loading state. Supabase client persists sessions in `localStorage` (configured in `src/integrations/supabase/client.ts`).
- **Post-login redirect** — `router.navigate({ to: "/dashboard" })` on success.
- **Logout** — Sign out button in the sidebar footer that calls `signOut()` then navigates to `/auth`.

Rebuilding all of that would throw away the working integration and would not change what you actually see on screen. The only visible difference between "what the spec describes" and "what's built" is the shell bleeding through — which the one-line fix above eliminates.

### About `/` → landing page

Your spec says `/` should be a landing page and `/auth` the auth page. Today `/` is the **splash** (2.2s blinking-logo animation) that auto-routes to `/auth`. That was the explicit decision earlier in this thread ("remove the entire landing page and implement the splash screen effect ... directly after the splash screen direct to the dashboard", later updated to route through `/auth`). I'm leaving the splash as-is unless you tell me to swap it back to a marketing landing page — that would be a separate, much larger change.

## Files touched

- `src/components/WorkspaceShell.tsx` — add `|| loc.pathname === "/auth"` to the bare-Outlet condition.

That's it. No new files, no deletions, no dependency changes.

## Verification

After the change, navigating to `/auth` should show only:
- The dark navy radial-gradient background
- The Intellecta wordmark top-left
- The "Continue without signing in" pill top-right
- The centered glass card with the sliding sign-in/sign-up panels

No sidebar, no breadcrumb, no "Role: Faculty" chip, no Install app button, no Sign out row. I'll confirm by reading the file post-edit and noting that `tsc --noEmit` stays clean.