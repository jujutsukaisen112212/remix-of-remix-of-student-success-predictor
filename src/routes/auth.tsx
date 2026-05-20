import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  const goToDashboard = () => router.navigate({ to: "/dashboard" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: name || undefined },
          },
        });
        if (error) throw error;
        const { data: s } = await supabase.auth.getSession();
        if (s.session) {
          toast.success("Account created — welcome!");
          goToDashboard();
        } else {
          toast.success("Check your email to confirm, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        goToDashboard();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = mode === "signup";

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(message);
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email above first");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send reset email";
      toast.error(message);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#08080c] text-white">
      <Toaster richColors position="top-center" />

      {/* Spline 3D background — cursor-reactive, fills the screen */}
      <SplineViewer
        url="https://prod.spline.design/PJuKqla7qFzCSnir/scene.splinecode"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Readability overlay — click-through so Spline keeps full interactivity */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/75 md:via-black/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 md:hidden" />

      {/* Top-left brand */}
      <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="font-mono text-sm font-bold tracking-[0.22em] text-white">INTELLECTA</span>
      </div>

      {/* Top-right escape hatch */}
      <button
        type="button"
        onClick={goToDashboard}
        className="absolute right-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
      >
        Continue without signing in <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {/* Auth card — pinned left-center on desktop, centered on mobile */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 md:justify-start md:px-[6vw]">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:p-8">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {isSignUp ? "Start your Intellecta workspace." : "Sign in to continue to Intellecta."}
          </p>

          {/* Tab toggle */}
          <div className="relative mt-6 grid grid-cols-2 rounded-lg border border-white/10 bg-white/5 p-1 text-sm">
            <span
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-md bg-white/10 transition-transform duration-300 ease-out"
              style={{ transform: isSignUp ? "translateX(100%)" : "translateX(0)" }}
            />
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`relative z-10 rounded-md py-1.5 font-medium transition-colors ${isSignUp ? "text-white/60" : "text-white"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`relative z-10 rounded-md py-1.5 font-medium transition-colors ${isSignUp ? "text-white" : "text-white/60"}`}
            >
              Sign up
            </button>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            or with email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {isSignUp && (
              <Field icon={<UserIcon className="h-4 w-4" />}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </Field>
            )}
            <Field icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />}>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </Field>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={forgotPassword}
                  className="text-xs text-white/60 transition hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-white to-white/85 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:from-white hover:to-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Create account" : "Sign in"}
            </button>

            {hasSession && (
              <button
                type="button"
                onClick={goToDashboard}
                className="w-full rounded-lg border border-white/10 py-2 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Continue as current user
              </button>
            )}
          </form>

          <p className="mt-5 text-center text-xs text-white/50">
            {isSignUp ? "Already have an account? " : "New to Intellecta? "}
            <button
              type="button"
              onClick={() => setMode(isSignUp ? "signin" : "signup")}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition focus-within:border-white/30 focus-within:bg-white/[0.07]">
      <span className="text-white/40">{icon}</span>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-1.9 13.3-5.1l-6.1-5.2c-2 1.5-4.5 2.3-7.2 2.3-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.1 5.2C40.8 35.8 43.5 30.4 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
    </svg>
  );
}