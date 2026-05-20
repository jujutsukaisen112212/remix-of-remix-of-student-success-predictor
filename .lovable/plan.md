## Goal

Replace the current `/auth` page with a fullscreen, cursor-reactive Spline 3D background and a glass auth card pinned to the left-center. Keep all existing auth logic (Supabase email/password sign-in + sign-up, post-login redirect to `/dashboard`, session listener, route guard via `_authenticated`).

## Files

1. **`index.html`** — add the Spline viewer module script in `<head>` so the custom element `<spline-viewer>` is globally registered (loads once, cached, avoids re-injecting per route).
   ```html
   <script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.94/build/spline-viewer.js"></script>
   ```

2. **`src/vite-env.d.ts`** (or new `src/spline.d.ts`) — declare the custom element for TSX:
   ```ts
   declare namespace JSX {
     interface IntrinsicElements {
       'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url?: string; 'loading-anim-type'?: string }, HTMLElement>;
     }
   }
   ```

3. **`src/routes/auth.tsx`** — full rewrite of the component, keeping the same `createFileRoute("/auth")` export and the same Supabase calls. New structure:
   - Root: `relative min-h-screen w-full overflow-hidden bg-[#08080c]`
   - Layer 1 (background): `<spline-viewer url="https://prod.spline.design/PJuKqla7qFzCSnir/scene.splinecode" class="absolute inset-0 h-full w-full" />` — NO `pointer-events-none` (cursor must reach it).
   - Layer 2 (readability overlay): `absolute inset-0 pointer-events-none bg-gradient-to-r from-black/70 via-black/30 to-transparent` — pointer-events disabled so cursor passes through to Spline.
   - Layer 3 (auth card): absolutely positioned `left-[6vw] top-1/2 -translate-y-1/2 w-full max-w-md` with `pointer-events-auto`. Rest of screen stays click-through to Spline.
   - Top-left: Intellecta wordmark (unchanged).
   - Top-right: "Continue without signing in" pill (unchanged behavior, restyled).

4. **No other files touched.** `_authenticated.tsx`, `use-auth.ts`, `WorkspaceShell.tsx` (already excludes `/auth`), Supabase client, route tree — all stay as-is.

## Auth card content

- Header: "Welcome back" / "Create account" + subtitle.
- Tab toggle: two pills "Sign in" | "Sign up" with sliding active indicator (CSS transition on `translateX`, no extra deps).
- Google button (full width, outlined, white text, Google `G` SVG icon) — calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ${origin}/auth } })`.
- Divider "or continue with email".
- Inputs (glass style: `bg-white/5 border-white/10 focus:border-white/30`): email, password. Sign-up also shows name.
- "Forgot password?" link (right-aligned, sign-in mode only) → calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${origin}/auth })` and toasts confirmation. No separate reset-password route added in this pass (matches current scope — can be added later if requested).
- Primary submit button: gradient `from-white to-white/80` text-black, with loading spinner.
- Mobile (`< md`): card centers horizontally, overlay becomes top-to-bottom gradient for readability.

## Design tokens

Use existing semantic tokens where possible; for the dark glass surface the file uses inline Tailwind arbitrary values (`bg-white/5`, `border-white/10`, `backdrop-blur-xl`) consistent with the current auth file. No `styles.css` changes needed — this page is intentionally a dark standalone surface that does not need to follow the dashboard theme tokens (same approach as the existing `auth.tsx`).

## Performance notes

- Spline viewer script loaded once via `index.html` (browser caches, no per-navigation reload).
- `<spline-viewer>` is a web component — React doesn't re-render its internals, so cursor interaction stays at native 60fps.
- Overlay div has `pointer-events-none`; auth card wrapper has `pointer-events-auto`. The empty right half of the screen passes clicks to Spline, preserving full cursor reactivity over the 3D face.
- No `will-change` or transform tricks on the viewer — Spline handles its own raf loop.
- No lazy-loading wrapper needed beyond the module script tag (it's already an ES module, deferred by default).

## Interactions kept identical to today

- `submit()` flow, error toasts, `goToDashboard()`, "Continue as current user" affordance when a session already exists, mode-switch state machine.
- Google added as additive option; email/password remains primary.

## Out of scope (call out, don't build)

- `/reset-password` page (current project has none). Forgot-password will email a link that lands back on `/auth`; the user is auto-signed-in via the recovery token. Adding a dedicated reset form is a follow-up.
- Enabling Google provider in Supabase dashboard — must be toggled on at https://supabase.com/dashboard/project/oudceonewduhsfhyiiny/auth/providers or the Google button will error. I'll surface this in the post-implementation message.
