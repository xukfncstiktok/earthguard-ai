import { createServerFn } from "@tanstack/react-start";
import { REGION_SEEDS } from "./regions";

export interface LiveClimate {
  id: string;
  /** mean daily max temperature over the last 7 days, °C */
  heat: number;
  /** total precipitation over the last 7 days, mm */
  precip: number;
  /** reference evapotranspiration over the last 7 days, mm */
  et0: number;
  /** 0-1 atmospheric water-deficit index (et0 vs rainfall) */
  dryness: number;
  /** mean 10m wind speed, km/h */
  wind: number;
  /** mean shortwave radiation, W/m² */
  solar: number;
  /** multiplier applied to this region's degradation pressure, 0.75 - 1.45 */
  stress: number;
}

export interface LiveClimateResult {
  fetchedAt: string;
  source: string;
  regions: LiveClimate[];
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/**
 * Pulls real observed weather for all 12 sentinel regions from Open-Meteo
 * (keyless, ERA5 + forecast blend) and converts it into a per-region
 * environmental stress multiplier the simulation runs on.
 */
export const getLiveClimate = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveClimateResult> => {
    const lat = REGION_SEEDS.map((r) => r.lat.toFixed(3)).join(",");
    const lon = REGION_SEEDS.map((r) => r.lon.toFixed(3)).join(",");
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,precipitation_sum,et0_fao_evapotranspiration,` +
      `wind_speed_10m_max,shortwave_radiation_sum&past_days=7&forecast_days=1&timezone=UTC`;

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    const json = (await res.json()) as unknown;
    const list = Array.isArray(json) ? json : [json];

    const regions: LiveClimate[] = REGION_SEEDS.map((seed, i) => {
      const d = (list[i] as { daily?: Record<string, number[]> } | undefined)?.daily;
      const tmax = (d?.["temperature_2m_max"] ?? []).filter((n) => typeof n === "number");
      const rain = (d?.["precipitation_sum"] ?? []).filter((n) => typeof n === "number");
      const et = (d?.["et0_fao_evapotranspiration"] ?? []).filter((n) => typeof n === "number");
      const wind = (d?.["wind_speed_10m_max"] ?? []).filter((n) => typeof n === "number");
      const rad = (d?.["shortwave_radiation_sum"] ?? []).filter((n) => typeof n === "number");

      const heat = mean(tmax);
      const precip = sum(rain);
      const et0 = sum(et);
      const deficit = et0 > 0 ? (et0 - precip) / et0 : 0;
      const dryness = clamp(deficit, 0, 1);

      // heat term is relative to a 22 °C comfort baseline, capped so polar
      // sentinels are not treated as permanently "safe"
      const heatTerm = clamp((heat - 22) / 18, -0.35, 0.45);
      const stress = clamp(0.92 + dryness * 0.38 + heatTerm * 0.35, 0.75, 1.45);

      return {
        id: seed.id,
        heat: Number(heat.toFixed(1)),
        precip: Number(precip.toFixed(1)),
        et0: Number(et0.toFixed(1)),
        dryness: Number(dryness.toFixed(3)),
        wind: Number(mean(wind).toFixed(1)),
        solar: Number((mean(rad) * 11.57).toFixed(0)),
        stress: Number(stress.toFixed(3)),
      };
    });

    return {
      fetchedAt: new Date().toISOString(),
      source: "Open-Meteo · ERA5 reanalysis + operational forecast (7-day window)",
      regions,
    };
  },
);
