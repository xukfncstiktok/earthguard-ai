import { CloudRain, Droplets, Radio, Sun, Thermometer, Wind, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURES, type ModelReport } from "@/lib/eco/forecast";
import type { LiveClimate } from "@/lib/eco/useLiveClimate";

/* ------------------------------------------------------------- live badge */

export function LiveBadge({
  isLive,
  isLoading,
  fetchedAt,
}: {
  isLive: boolean;
  isLoading: boolean;
  fetchedAt?: string | undefined;
}) {
  const label = isLoading ? "linking…" : isLive ? "live ingest" : "offline model";
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1",
        isLive ? "border-primary/40 bg-primary/5" : "border-border",
      )}
      title={fetchedAt ? `Last sync ${new Date(fetchedAt).toUTCString()}` : undefined}
    >
      <Radio
        className={cn("size-3", isLive ? "animate-pulse text-primary" : "text-muted-foreground")}
      />
      <span className="label-mono">{label}</span>
    </span>
  );
}

/* --------------------------------------------------------- live telemetry */

const fmt = (n: number, unit: string) => `${n.toFixed(n >= 100 ? 0 : 1)}${unit}`;

export function RegionLive({ live }: { live?: LiveClimate | undefined }) {
  if (!live) {
    return (
      <p className="label-mono rounded-md border border-dashed border-border/70 px-2.5 py-2">
        Awaiting live climate ingest for this region…
      </p>
    );
  }
  const items = [
    { Icon: Thermometer, l: "7d mean max", v: fmt(live.heat, "°C") },
    { Icon: CloudRain, l: "7d rainfall", v: fmt(live.precip, " mm") },
    { Icon: Droplets, l: "water deficit", v: `${(live.dryness * 100).toFixed(0)}%` },
    { Icon: Wind, l: "wind", v: fmt(live.wind, " km/h") },
    { Icon: Sun, l: "solar", v: `${live.solar} Wh/m²` },
  ];
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-mono">Observed conditions · last 7 days</span>
        <span
          className={cn(
            "numeric text-[0.65rem]",
            live.stress > 1.08 ? "text-crit" : live.stress < 0.95 ? "text-primary" : "text-warn",
          )}
        >
          stress ×{live.stress.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(({ Icon, l, v }) => (
          <div key={l} className="rounded-md bg-surface-2/50 px-2.5 py-2">
            <p className="label-mono flex items-center gap-1">
              <Icon className="size-3 text-accent" />
              {l}
            </p>
            <p className="numeric mt-1 truncate text-xs text-foreground">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ model panel */

export function ModelPanel({
  report,
  forecast,
  health,
}: {
  report: ModelReport;
  forecast: { t: number; health: number; band: number }[];
  health: number;
}) {
  const horizon = forecast[forecast.length - 1];
  const delta = horizon ? horizon.health - health : 0;
  const trained = report.samples >= 4;
  const maxW = Math.max(0.0001, ...report.weights.slice(1).map((w) => Math.abs(w)));

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <BrainCircuit className="mt-0.5 size-4 shrink-0 text-accent" />
        <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
          A ridge-regression response model trains in your browser on every tick, learning how
          threat intensity, coverage and real climate stress move planetary integrity — then rolls
          itself {forecast.length || 18} steps forward.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { l: "samples", v: String(report.samples) },
          { l: "GD epochs", v: String(report.epochs) },
          { l: "RMSE", v: report.rmse.toFixed(2) },
          { l: "R²", v: trained ? report.r2.toFixed(2) : "—" },
        ].map((x) => (
          <div key={x.l} className="rounded-md bg-surface-2/50 px-2 py-1.5">
            <p className="label-mono">{x.l}</p>
            <p className="numeric mt-0.5 text-xs text-foreground">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="label-mono">Learned weights · Δintegrity per unit</p>
        {FEATURES.slice(1).map((f, i) => {
          const w = report.weights[i + 1] ?? 0;
          const pct = (Math.abs(w) / maxW) * 100;
          return (
            <div key={f} className="flex items-center gap-2">
              <span className="label-mono w-24 shrink-0 truncate">{f}</span>
              <div className="flex h-1.5 flex-1 items-center overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn("h-full rounded-full", w >= 0 ? "bg-primary" : "bg-crit")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="numeric w-12 shrink-0 text-right text-[0.65rem] text-muted-foreground">
                {w >= 0 ? "+" : ""}
                {w.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-md border border-border/70 px-3 py-2">
        <p className="label-mono">Model forecast · {forecast.length || 0} steps out</p>
        <p className="mt-1 text-[0.78rem] text-foreground">
          {trained ? (
            <>
              Integrity trending to{" "}
              <span className={cn("numeric", delta >= 0 ? "text-primary" : "text-crit")}>
                {horizon ? horizon.health.toFixed(1) : "—"}%
              </span>{" "}
              (<span className="numeric">{delta >= 0 ? "+" : ""}
              {delta.toFixed(1)}</span>) ± {horizon ? horizon.band.toFixed(1) : "0"}
            </>
          ) : (
            "Collecting observations — forecast unlocks after 4 ticks."
          )}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------- live stress heat rail */

export function ClimateStressRail({
  regions,
  live,
  onSelect,
}: {
  regions: { id: string; code: string; name: string }[];
  live: Record<string, LiveClimate>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      {regions.map((r) => {
        const s = live[r.id]?.stress;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            title={`${r.name}${s ? ` — observed stress ×${s.toFixed(2)}` : ""}`}
            className={cn(
              "numeric min-h-8 shrink-0 rounded border px-2 py-1 text-[0.6rem] transition-colors sm:min-h-0 sm:px-1.5 sm:py-0.5",
              s === undefined && "border-border text-muted-foreground",
              s !== undefined && s > 1.08 && "border-crit/50 bg-crit/10 text-crit",
              s !== undefined && s <= 1.08 && s >= 0.98 && "border-warn/50 bg-warn/10 text-warn",
              s !== undefined && s < 0.98 && "border-primary/50 bg-primary/10 text-primary",
            )}
          >
            {r.code} {s ? `×${s.toFixed(2)}` : "··"}
          </button>
        );
      })}
    </div>
  );
}
