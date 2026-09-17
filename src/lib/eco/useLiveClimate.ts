import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveClimate, type LiveClimate, type LiveClimateResult } from "./live.functions";

export type { LiveClimate, LiveClimateResult };

/** Live observed climate for every sentinel region, refreshed every 10 minutes. */
export function useLiveClimate() {
  const fn = useServerFn(getLiveClimate);
  const query = useQuery<LiveClimateResult>({
    queryKey: ["live-climate"],
    queryFn: () => fn(),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 1,
  });

  const byId: Record<string, LiveClimate> = {};
  for (const r of query.data?.regions ?? []) byId[r.id] = r;

  const stress: Record<string, number> = {};
  for (const r of query.data?.regions ?? []) stress[r.id] = r.stress;

  const values = query.data?.regions ?? [];
  const meanStress = values.length
    ? values.reduce((a, r) => a + r.stress, 0) / values.length
    : 1;

  return {
    byId,
    stress,
    meanStress,
    fetchedAt: query.data?.fetchedAt,
    source: query.data?.source,
    isLive: !!query.data && !query.isError,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
