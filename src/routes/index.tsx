import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/intellecta-logo.png";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.navigate({ to: "/auth" });
    }, 2200);
    return () => clearTimeout(t);
  }, [router]);

  const go = () => router.navigate({ to: "/auth" });

  return (
    <button
      type="button"
      onClick={go}
      aria-label="Enter Intellecta"
      className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center bg-background"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.93 0.04 85 / 0.45), transparent 60%), radial-gradient(circle at 50% 80%, oklch(0.34 0.12 258 / 0.18), transparent 60%)",
        }}
      />
      <img
        src={logo}
        alt="Intellecta"
        className="intellecta-blink h-44 w-44 select-none rounded-full bg-white object-cover p-4 shadow-2xl ring-4 ring-white/20 md:h-60 md:w-60"
        draggable={false}
      />
      <div className="intellecta-fadein mt-8 text-center">
        <h1 className="font-mono text-3xl font-bold tracking-[0.4em] text-foreground md:text-4xl">
          INTELLECTA
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Academic ML Workspace
        </p>
      </div>
    </button>
  );
}