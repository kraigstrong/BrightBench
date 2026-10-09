// Per-level numbers for each world, for the beta report's charts: installs that started and cleared each level (the
// funnel), tries to a first clear, and win rate. Browser-safe: no Node imports.
type RampRow = { context: { world: string; mode: string; level: number } | null; counts: Record<string, number> };
// Groups for tries to a first clear. The game reports tries in buckets by upper bound (1, 2, 3, 5, 10, 20, 50, ...);
// each falls in the first group whose `max` reaches it.
export const tryGroups = [
  { label: '1', max: 1 }, { label: '2', max: 2 }, { label: '3', max: 3 }, { label: '4–5', max: 5 },
  { label: '6–10', max: 10 }, { label: '11–20', max: 20 }, { label: '21+', max: Infinity },
];
// `started` and `cleared` count installs: the game reports each once per install and level. `tries` counts first
// clears per entry of `tryGroups`: the runs it took an install to clear the level the first time, the winning run
// and any it quit included.
export type RampLevel = {
  level: number; wins: number; deaths: number; rate: number | null; started: number; cleared: number;
  tries: number[]; firstClears: number; medianTries: string | null;
};
export type RampWorld = { world: string; levels: RampLevel[] };
type Totals = { wins: number; deaths: number; started: number; cleared: number; tries: number[] };
const empty = (): Totals => ({ wins: 0, deaths: 0, started: 0, cleared: 0, tries: tryGroups.map(() => 0) });
// Campaign levels only, every build and content revision in the selection pooled together.
// Worlds keep the order of `rows` (the report's sort); levels run from 1 to the highest one reported, gaps included.
export function difficultyRamp(rows: RampRow[]): RampWorld[] {
  const worlds = new Map<string, Map<number, Totals>>();
  for (const { context, counts } of rows) {
    if (!context || context.mode !== 'campaign') continue;
    const levels = worlds.get(context.world) ?? new Map(); worlds.set(context.world, levels);
    const level = levels.get(context.level) ?? empty(); levels.set(context.level, level);
    level.wins += counts['outcome.win'] ?? 0; level.deaths += counts['outcome.death'] ?? 0;
    level.started += counts['milestone.level_started'] ?? 0; level.cleared += counts['milestone.level_cleared'] ?? 0;
    for (const [field, n] of Object.entries(counts)) {
      const bound = field.startsWith('attempt.') ? Number(field.slice(8)) : NaN;
      if (Number.isFinite(bound)) level.tries[tryGroups.findIndex(g => bound <= g.max)]! += n;
    }
  }
  return [...worlds].map(([world, levels]) => ({
    world,
    levels: Array.from({ length: Math.max(...levels.keys()) }, (_, i) => {
      const { wins, deaths, started, cleared, tries } = levels.get(i + 1) ?? empty();
      const firstClears = tries.reduce((a, b) => a + b, 0);
      return { level: i + 1, wins, deaths, rate: wins + deaths ? wins / (wins + deaths) : null, started, cleared,
        tries, firstClears, medianTries: median(tries, firstClears) };
    }),
  }));
}
// The group holding the middle first clear.
function median(tries: number[], total: number) {
  if (!total) return null;
  let seen = 0;
  return tryGroups.find((_, i) => (seen += tries[i]!) >= total / 2)!.label;
}
