import "./tap-loader.css";

export function TapLoader({ label = "Running ML model…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10">
      <div className="tap-hand">
        <div className="tap-finger" />
        <div className="tap-finger" />
        <div className="tap-finger" />
        <div className="tap-finger" />
        <div className="tap-palm" />
        <div className="tap-thumb" />
      </div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}