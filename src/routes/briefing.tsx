import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BrainCircuit,
  Database,
  Globe2,
  Leaf,
  Printer,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { INTERVENTIONS, REGION_SEEDS } from "@/lib/eco/regions";

const title = "Mission Briefing — EcoGrid AI";
const description =
  "Judge-ready technical and impact briefing for EcoGrid AI: live climate observations, online machine learning, 3D planetary monitoring, and explainable intervention simulation.";

export const Route = createFileRoute("/briefing")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Briefing,
});

const evidence = [
  {
    icon: Radio,
    title: "Observed climate",
    value: "12 sentinel regions",
    copy: "Seven-day heat, rainfall, evapotranspiration, wind, and solar observations are fetched from Open-Meteo and converted into a bounded regional stress signal.",
  },
  {
    icon: BrainCircuit,
    title: "Learning system",
    value: "Online ridge regression",
    copy: "A model trains locally on every simulation tick using threat intensity, mitigation coverage, critical-region share, recovery momentum, and live climate stress.",
  },
  {
    icon: ShieldCheck,
    title: "Action layer",
    value: `${INTERVENTIONS.length} interventions`,
    copy: "Each response has an explicit cost, cooldown, power, and threat match. Matching a countermeasure to the dominant threat produces the strongest recovery.",
  },
  {
    icon: Globe2,
    title: "Planetary view",
    value: "Interactive 3D Earth",
    copy: "The globe links every data point to place, lets users focus regions directly, and visualizes deployments as miniature environmental systems.",
  },
];

function Briefing() {
  const people = REGION_SEEDS.reduce((sum, region) => sum + region.peopleMillions, 0);
  const carbon = REGION_SEEDS.reduce((sum, region) => sum + region.carbonAtRisk, 0);

  return (
    <main className="grid-lines min-h-screen px-3 py-4 sm:px-5 lg:px-8 lg:py-8">
      <article className="mx-auto max-w-6xl space-y-4">
        <nav className="print-hide flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Command center
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-accent/40 bg-accent/5 px-3 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
          >
            <Printer className="size-4" />
            Print briefing
          </button>
        </nav>

        <header className="border-b border-border/70 py-8 sm:py-12">
          <div className="flex items-center gap-2 text-primary">
            <Leaf className="size-5" />
            <span className="label-mono text-primary">NextStep Hacks 2026 · Earth Forward</span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            EcoGrid AI mission briefing
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A planetary response simulator that connects observed climate conditions, explainable
            machine learning, and direct intervention choices in one working command system.
          </p>
        </header>

        <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
          {[
            ["Regions monitored", String(REGION_SEEDS.length)],
            ["People represented", `${people.toFixed(0)}M`],
            ["Carbon exposure", `${carbon.toFixed(0)} Mt CO₂e`],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface px-5 py-6">
              <p className="label-mono">{label}</p>
              <p className="numeric mt-2 text-3xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </section>

        <section className="py-6 sm:py-10">
          <p className="label-mono text-primary">How the system works</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            From observation to measurable action
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {evidence.map(({ icon: Icon, title: itemTitle, value, copy }) => (
              <div key={itemTitle} className="panel p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 text-accent">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="label-mono">{itemTitle}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{value}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="label-mono text-primary">Methodology</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Transparent by design</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              EcoGrid is a decision-training simulation, not a claim of scientific prediction. Every
              intervention effect is visible in code and the learned model reports its sample count,
              weights, error, fit, forecast, and uncertainty band in the interface.
            </p>
          </div>
          <ol className="space-y-3">
            {[
              ["01", "Ingest", "Open-Meteo observations update regional heat and water-deficit stress."],
              ["02", "Simulate", "Threat pressure, incidents, mitigation decay, and recovery update once per tick."],
              ["03", "Learn", "Online gradient descent fits the latest observed response without sending user data away."],
              ["04", "Act", "Users or Auto-AI deploy constrained countermeasures and immediately see ecological trade-offs."],
            ].map(([number, step, copy]) => (
              <li key={number} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border/60 pb-3">
                <span className="numeric text-accent">{number}</span>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{step}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel p-5 sm:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Database className="size-4" />
                <p className="label-mono text-accent">Data provenance</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Weather observations use Open-Meteo's public forecast and historical weather APIs.
                Sentinel-region baselines and response coefficients are hackathon simulation inputs,
                clearly separated from observed measurements.
              </p>
            </div>
            <div>
              <p className="label-mono text-primary">Why it matters</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Climate tools often isolate dashboards from decisions. EcoGrid makes consequences
                explorable: limited resources, unequal regional risk, intervention fit, and uncertainty
                are visible in the same loop.
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-border/70 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>EcoGrid AI · Earth Forward</span>
          <span className="numeric">Live data · Local ML · Interactive 3D</span>
        </footer>
      </article>
    </main>
  );
}