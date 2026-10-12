// The Bigger Fish paywall funnel: what the game reports about its one-time unlock, and the beta report's view of it.
// Browser-safe: no Node imports. Keep in sync with ArcadeAnalytics.swift (OfferSource, purchase and restore outcomes).

// Where the unlock's screen was opened from: a padlocked level on a level map, Next level onto one, the world map's
// Unlock all button, a world with no free levels, or a world conquered without the unlock (Shallow Reef, in practice).
export const offerSources = ['padlocked_level', 'next_level', 'unlock_all', 'locked_world', 'conquered'] as const;
export type OfferSource = typeof offerSources[number];
// Pending is Ask to Buy, waiting on a parent.
export const purchaseOutcomes = ['unlocked', 'pending', 'cancelled', 'failed'] as const;
export type PurchaseOutcome = typeof purchaseOutcomes[number];
// `not_found` includes not reaching the App Store, as the game's own message does.
export const restoreOutcomes = ['restored', 'not_found'] as const;
export type RestoreOutcome = typeof restoreOutcomes[number];
// Restores can also start in Settings, which is not an offer.
export const restoreSources = [...offerSources, 'settings'] as const;
export type RestoreSource = typeof restoreSources[number];

type FunnelRow = { context: { world: string; mode: string } | null; counts: Record<string, number> };
export type FunnelSource = {
  source: RestoreSource; shown: number; first: number;
  purchases: Record<PurchaseOutcome, number>; restores: Record<RestoreOutcome, number>;
};
export type FunnelRuns = { runs: number; wins: number; deaths: number; rate: number | null };
export type PaywallFunnel = {
  sources: FunnelSource[];
  // Installs that beat each world's ten main levels (once per install).
  conquered: { world: string; installs: number }[];
  // Campaign runs split by whether the player had the unlock; runs from builds or moments it wasn't on sale aren't in either.
  runs: { world: string; free: FunnelRuns; unlocked: FunnelRuns }[];
};
const runs = (): FunnelRuns => ({ runs: 0, wins: 0, deaths: 0, rate: null });
// Every build in the selection pooled. Worlds keep the order of `rows` (the report's sort). With `onlyWorld`, conquests
// and runs are that world's only; offers, purchases and restores belong to no world, so they stay whole.
export function paywallFunnel(rows: FunnelRow[], onlyWorld?: string): PaywallFunnel {
  const sources = restoreSources.map((source): FunnelSource => ({
    source, shown: 0, first: 0,
    purchases: Object.fromEntries(purchaseOutcomes.map(o => [o, 0])) as Record<PurchaseOutcome, number>,
    restores: Object.fromEntries(restoreOutcomes.map(o => [o, 0])) as Record<RestoreOutcome, number>,
  }));
  const conquered = new Map<string, number>();
  const split = new Map<string, { free: FunnelRuns; unlocked: FunnelRuns }>();
  for (const { context, counts } of rows) {
    if (!context) {
      for (const s of sources) {
        s.shown += counts[`offer.shown.${s.source}`] ?? 0; s.first += counts[`offer.first.${s.source}`] ?? 0;
        for (const o of purchaseOutcomes) s.purchases[o] += counts[`purchase.${o}.${s.source}`] ?? 0;
        for (const o of restoreOutcomes) s.restores[o] += counts[`restore.${o}.${s.source}`] ?? 0;
      }
      continue;
    }
    if (context.mode !== 'campaign' || (onlyWorld && context.world !== onlyWorld)) continue;
    conquered.set(context.world, (conquered.get(context.world) ?? 0) + (counts['milestone.world_conquered'] ?? 0));
    const world = split.get(context.world) ?? { free: runs(), unlocked: runs() }; split.set(context.world, world);
    for (const access of ['free', 'unlocked'] as const) {
      const r = world[access];
      for (const outcome of ['win', 'death', 'quit', 'abandoned']) r.runs += counts[`${access}.${outcome}`] ?? 0;
      r.wins += counts[`${access}.win`] ?? 0; r.deaths += counts[`${access}.death`] ?? 0;
    }
  }
  for (const world of split.values()) for (const r of [world.free, world.unlocked]) r.rate = r.wins + r.deaths ? r.wins / (r.wins + r.deaths) : null;
  return {
    sources,
    conquered: [...conquered].map(([world, installs]) => ({ world, installs })),
    runs: [...split].map(([world, s]) => ({ world, ...s })),
  };
}
