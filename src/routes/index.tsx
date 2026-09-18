import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EarthGlobe } from "@/components/globe/EarthGlobe";
import { CommandTerminal } from "@/components/mission/CommandTerminal";
import {
  Advisory,
  BootSplash,
  CommandDeck,
  EventFeed,
  Icons,
  MissionHeader,
  Panel,
  RegionDossier,
  RegionList,
  Sparkline,
  StatTile,
} from "@/components/mission/MissionUI";
import {
  ClimateStressRail,
  LiveBadge,
  ModelPanel,
  RegionLive,
} from "@/components/mission/IntelPanels";
import { THREAT_LABEL } from "@/lib/eco/regions";
import { missionClock, statusOf, useMission } from "@/lib/eco/mission";
import { useLiveClimate } from "@/lib/eco/useLiveClimate";
import { useForecastModel } from "@/lib/eco/forecast";

const title = "EcoGrid AI — Planetary Biosphere Command";
const description =
  "Live mission control for Earth's biosphere: real observed climate data for 12 sentinel regions on a 3D globe, an in-browser AI model that learns the planet's response, and autonomous countermeasure deployment.";

export const Route = createFileRoute("/")({
  ssr: false,
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
  component: Index,
});

function Index() {
  const {
    state,
    selected,
    health,
    trend,
    advisory,
    criticals,
    covered,
    features,
    setLive,
    select,
    deploy,
    deployAt,
    setAuto,
    log,
    clearLog,
    toggle,
    reset,
  } = useMission();

  const climate = useLiveClimate();
  const { report, forecast } = useForecastModel(state.history, features);

  // feed real observed climate stress into the simulation
  useEffect(() => {
    if (climate.isLive && climate.fetchedAt && Object.keys(climate.stress).length) {
      setLive(climate.stress, climate.fetchedAt);
    }
  }, [climate.isLive, climate.fetchedAt, climate.stress, setLive]);

  const status = statusOf(health);

  return (
    <>
      <BootSplash />
      <main className="grid-lines min-h-screen p-3 lg:p-4">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3">
          <MissionHeader
            clock={missionClock(state.tick)}
            running={state.running}
            onToggle={toggle}
            onReset={reset}
            health={health}
            auto={state.auto}
            onAutoChange={setAuto}
          />

          <div className="panel flex flex-col items-stretch gap-2 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
            <LiveBadge
              isLive={climate.isLive}
              isLoading={climate.isLoading}
              fetchedAt={climate.fetchedAt}
            />
            <span className="label-mono hidden sm:inline">
              real observed heat &amp; water deficit · Open-Meteo
            </span>
            <div className="min-w-0 flex-1">
              <ClimateStressRail regions={state.regions} live={climate.byId} onSelect={select} />
            </div>
            <Link
              to="/briefing"
              className="label-mono shrink-0 self-start rounded-md border border-accent/40 px-2.5 py-2 text-accent transition-colors hover:bg-accent/10 sm:ml-auto sm:self-auto"
            >
              mission briefing →
            </Link>
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
            {/* left rail */}
            <div className="flex min-h-0 flex-col gap-3">
              <Panel
                title="Sentinel regions"
                right={
                  <span className="numeric text-[0.65rem] text-muted-foreground">
                    {covered}/{state.regions.length} covered
                  </span>
                }
                className="md:h-[420px] xl:h-[420px]"
                bodyClass="p-2"
              >
                <RegionList regions={state.regions} selected={state.selected} onSelect={select} />
              </Panel>

              <Panel
                title="Biosphere trend"
                right={
                  <span
                    className={`numeric text-[0.65rem] ${trend > 0.05 ? "text-primary" : "text-crit"}`}
                  >
                    {trend > 0.05 ? "▲ stabilising" : "▼ degrading"} {trend >= 0 ? "+" : ""}
                    {trend.toFixed(2)}/t
                  </span>
                }
              >
                <Sparkline data={state.history} projection={forecast} trend={trend} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="label-mono">Global integrity</span>
                  <span
                    className={`numeric text-sm font-semibold ${trend > 0.05 ? "text-primary" : "text-foreground"}`}
                  >
                    {health.toFixed(1)}%
                  </span>
                </div>
                <p className="label-mono mt-1">dashed line = ML forecast, not extrapolation</p>
              </Panel>
            </div>

            {/* globe */}
            <Panel
              title="Orbital view · sentinel constellation"
              right={
                <span className="label-mono">
                  {criticals > 0 ? `${criticals} critical` : "nominal"}
                </span>
              }
              bodyClass="p-0"
              className="scanline relative min-w-0 overflow-hidden md:col-span-2 xl:col-span-1"
            >
              <div className="h-[clamp(380px,54vh,620px)] w-full sm:h-[clamp(430px,56vh,640px)] xl:h-[560px]">
                <EarthGlobe
                  regions={state.regions}
                  selected={state.selected}
                  onSelect={select}
                  strike={state.strike}
                />
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 sm:left-4 sm:gap-4">
                {(
                  [
                    ["Stable", "bg-primary"],
                    ["Strained", "bg-warn"],
                    ["Critical", "bg-crit"],
                  ] as const
                ).map(([l, c]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${c}`} />
                    <span className="label-mono">{l}</span>
                  </span>
                ))}
              </div>
            </Panel>

            {/* right rail */}
            <div className="flex min-h-0 flex-col gap-3 md:col-span-2 xl:col-span-1">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-2">
                <StatTile
                  label="Integrity"
                  value={health.toFixed(1)}
                  unit="%"
                  sub={`Grid ${status}`}
                  tone={status === "stable" ? "bio" : status === "strained" ? "warn" : "crit"}
                  icon={Icons.Gauge}
                />
                <StatTile
                  label="Carbon secured"
                  value={state.carbonSecured.toFixed(1)}
                  unit="Mt"
                  sub="CO₂e kept in place"
                  tone="bio"
                  icon={Icons.Leaf}
                />
                <StatTile
                  label="Deployments"
                  value={String(state.deployments)}
                  sub={`${state.matched} matched to threat`}
                  tone="signal"
                  icon={Icons.Sparkles}
                />
                <StatTile
                  label="Critical zones"
                  value={String(criticals)}
                  sub={`${covered} under active cover`}
                  tone={criticals ? "crit" : "bio"}
                  icon={Icons.AlertTriangle}
                />
              </div>

              <Advisory
                targetName={advisory.target.name}
                planName={advisory.plan.name}
                reason={`${THREAT_LABEL[advisory.target.threat]} is driving the steepest loss there, with ${advisory.target.carbonAtRisk} Mt CO₂e exposed${
                  climate.byId[advisory.target.id]
                    ? ` and observed climate stress running ×${climate.byId[advisory.target.id]?.stress.toFixed(2)}`
                    : ""
                }.`}
                onJump={() => select(advisory.target.id)}
              />

              <Panel
                title="Telemetry feed"
                right={<Icons.Activity className="size-3.5 text-accent" />}
                className="h-[218px]"
                bodyClass="p-3"
              >
                <EventFeed events={state.events} />
              </Panel>
            </div>
          </div>

          {/* intelligence row */}
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <Panel
              title="Predictive core · online learning"
              right={
                <span className="numeric text-[0.65rem] text-muted-foreground">
                  ridge · SGD · {report.epochs} epochs
                </span>
              }
            >
              <ModelPanel report={report} forecast={forecast} health={health} />
            </Panel>
            <Panel
              title="Region dossier"
              right={
                <span className="label-mono">
                  {climate.byId[selected.id] ? "live-linked" : "sim only"}
                </span>
              }
            >
              <div className="space-y-4">
                <RegionDossier region={selected} />
                <RegionLive live={climate.byId[selected.id]} />
              </div>
            </Panel>
          </div>

          <Panel title="Command deck" right={<Icons.Satellite className="size-3.5 text-primary" />}>
            <CommandDeck
              credits={state.credits}
              maxCredits={state.maxCredits}
              cooldowns={state.cooldowns}
              regionThreat={selected.threat}
              onDeploy={deploy}
            />
          </Panel>

          <CommandTerminal
            regions={state.regions}
            health={health}
            auto={state.auto}
            credits={state.credits}
            criticals={criticals}
            deployAt={deployAt}
            setAuto={setAuto}
            select={select}
            log={log}
            clearLog={clearLog}
          />

          <footer className="label-mono px-1 pb-2 text-center">
            EcoGrid AI · live Open-Meteo ingest + in-browser learning model · built for planetary
            response drills
          </footer>
        </div>
      </main>
    </>
  );
}
