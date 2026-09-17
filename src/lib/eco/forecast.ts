import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A tiny online-learning model that runs entirely in the browser.
 *
 * It learns the planet's response function: given the current state of the
 * grid (threat intensity, mitigation coverage, critical fraction, recovery
 * momentum and live climate stress) it predicts the change in global
 * integrity on the next time-step. Weights are fit with mini-batch gradient
 * descent and L2 (ridge) regularisation over a replay buffer of every tick
 * observed so far — so accuracy visibly improves while the mission runs.
 */

export const FEATURES = [
  "bias",
  "intensity",
  "coverage",
  "critical",
  "momentum",
  "climate stress",
] as const;

export type FeatureVector = number[]; // length = FEATURES.length

export interface Sample {
  x: FeatureVector;
  y: number; // observed delta health
}

export interface ModelReport {
  weights: number[];
  samples: number;
  epochs: number;
  loss: number; // mean squared error on the replay buffer
  rmse: number;
  r2: number;
  lastError: number;
}

const DIM = FEATURES.length;

export class OnlineRidge {
  w: number[] = new Array(DIM).fill(0);
  buffer: Sample[] = [];
  epochs = 0;
  lastError = 0;
  private lr = 0.035;
  private l2 = 0.002;

  predict(x: FeatureVector) {
    let s = 0;
    for (let i = 0; i < DIM; i++) s += this.w[i]! * (x[i] ?? 0);
    return s;
  }

  observe(sample: Sample) {
    this.lastError = sample.y - this.predict(sample.x);
    this.buffer.push(sample);
    if (this.buffer.length > 400) this.buffer.shift();
    this.train(6);
  }

  /** mini-batch gradient descent passes over the replay buffer */
  train(passes = 1) {
    const n = this.buffer.length;
    if (!n) return;
    for (let p = 0; p < passes; p++) {
      const grad = new Array(DIM).fill(0);
      for (const s of this.buffer) {
        const err = this.predict(s.x) - s.y;
        for (let i = 0; i < DIM; i++) grad[i]! += (err * (s.x[i] ?? 0)) / n;
      }
      for (let i = 0; i < DIM; i++) {
        this.w[i] = this.w[i]! - this.lr * (grad[i]! + this.l2 * this.w[i]!);
      }
      this.epochs++;
    }
  }

  report(): ModelReport {
    const n = this.buffer.length;
    if (!n) {
      return {
        weights: [...this.w],
        samples: 0,
        epochs: this.epochs,
        loss: 0,
        rmse: 0,
        r2: 0,
        lastError: 0,
      };
    }
    const ys = this.buffer.map((s) => s.y);
    const mean = ys.reduce((a, b) => a + b, 0) / n;
    let sse = 0;
    let sst = 0;
    for (const s of this.buffer) {
      const e = s.y - this.predict(s.x);
      sse += e * e;
      sst += (s.y - mean) ** 2;
    }
    return {
      weights: [...this.w],
      samples: n,
      epochs: this.epochs,
      loss: sse / n,
      rmse: Math.sqrt(sse / n),
      r2: sst > 1e-9 ? Math.max(-1, 1 - sse / sst) : 0,
      lastError: this.lastError,
    };
  }
}

export interface GridFeatures {
  intensity: number; // mean threat intensity 0-1
  coverage: number; // mean mitigation coverage 0-1
  critical: number; // fraction of regions critical 0-1
  momentum: number; // recovery momentum (scaled)
  stress: number; // mean live climate stress multiplier
}

export function toVector(f: GridFeatures): FeatureVector {
  return [1, f.intensity, f.coverage, f.critical, f.momentum / 6, f.stress - 1];
}

/**
 * Trains on every tick and rolls the learned dynamics forward to produce a
 * forecast plus a confidence band derived from the model's own RMSE.
 */
export function useForecastModel(
  history: { t: number; health: number }[],
  features: GridFeatures,
  steps = 18,
) {
  const modelRef = useRef<OnlineRidge>(null);
  if (!modelRef.current) modelRef.current = new OnlineRidge();
  const model = modelRef.current;

  const [report, setReport] = useState<ModelReport>(() => model.report());
  const prev = useRef<{ t: number; health: number; x: FeatureVector } | null>(null);

  const last = history[history.length - 1];

  useEffect(() => {
    if (!last) return;
    const x = toVector(features);
    const p = prev.current;
    if (p && last.t !== p.t) {
      model.observe({ x: p.x, y: last.health - p.health });
      setReport(model.report());
    }
    prev.current = { t: last.t, health: last.health, x };
    // features change on every tick with history; keyed on tick to stay stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.t]);

  const forecast = useMemo(() => {
    if (!last || report.samples < 4) return [] as { t: number; health: number; band: number }[];
    let h = last.health;
    let f: GridFeatures = { ...features };
    const out: { t: number; health: number; band: number }[] = [];
    for (let i = 1; i <= steps; i++) {
      // roll the controllable state forward the way the grid actually behaves:
      // coverage decays, momentum decays, intensity rebuilds once cover fades
      f = {
        intensity: Math.min(1, f.intensity + 0.012 * (1 - f.coverage)),
        coverage: f.coverage * 0.93,
        critical: f.critical,
        momentum: f.momentum * 0.9,
        stress: f.stress,
      };
      const d = model.predict(toVector(f));
      h = Math.max(4, Math.min(100, h + d));
      out.push({ t: last.t + i, health: h, band: report.rmse * Math.sqrt(i) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.t, report.samples, report.rmse, steps]);

  return { report, forecast };
}
