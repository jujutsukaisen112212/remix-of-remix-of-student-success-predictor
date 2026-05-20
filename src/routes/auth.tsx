import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import logo from "@/assets/intellecta-logo.png";

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

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, oklch(0.34 0.12 258 / 0.6), transparent 55%), radial-gradient(circle at 85% 80%, oklch(0.78 0.13 85 / 0.25), transparent 55%), oklch(0.13 0.03 258)",
      }}
    >
      <Toaster richColors position="top-center" />
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
          <img src={logo} alt="Intellecta" className="h-7 w-7 object-contain" />
        </div>
        <span className="font-mono text-sm font-bold tracking-[0.22em] text-white">INTELLECTA</span>
      </div>

      <button
        type="button"
        onClick={goToDashboard}
        className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur hover:bg-white/10"
      >
        Continue without signing in <ArrowRight className="h-3.5 w-3.5" />
      </button>

      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl md:grid-cols-2">
          {/* Form side */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <h2 className="font-mono text-2xl font-bold tracking-wide text-white">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {isSignUp ? "Join the Intellecta workspace." : "Sign in to your workspace."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.78_0.13_85)] py-2.5 text-sm font-semibold text-[oklch(0.18_0.04_258)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignUp ? "Create account" : "Sign in"}
              </button>

              {hasSession && (
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="w-full rounded-lg border border-white/15 py-2 text-xs font-medium text-white/80 hover:bg-white/5"
                >
                  Continue as current user
                </button>
              )}
            </form>
          </div>

          {/* Switch panel */}
          <div className="relative hidden flex-col items-center justify-center gap-4 bg-gradient-to-br from-[oklch(0.34_0.12_258)] to-[oklch(0.18_0.04_258)] p-12 text-center md:flex">
            <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 30%, oklch(0.78 0.13 85 / 0.4), transparent 60%)" }} />
            <div className="relative">
              <h3 className="font-mono text-2xl font-bold text-white">
                {isSignUp ? "One of us?" : "New here?"}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm text-white/70">
                {isSignUp
                  ? "Welcome back! Sign in to continue your journey with Intellecta."
                  : "Join us today and unlock the full Intellecta academic ML workspace."}
              </p>
              <button
                type="button"
                onClick={() => setMode(isSignUp ? "signin" : "signup")}
                className="mt-6 rounded-full border border-white/40 px-7 py-2 text-xs font-semibold tracking-wider text-white transition hover:bg-white/10"
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only switch link */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/60 md:hidden">
        {isSignUp ? "Already have an account? " : "New to Intellecta? "}
        <button onClick={() => setMode(isSignUp ? "signin" : "signup")} className="font-semibold text-white underline">
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-[oklch(0.78_0.13_85)]">
      <span className="text-white/50">{icon}</span>
      {children}
    </div>
  );
}