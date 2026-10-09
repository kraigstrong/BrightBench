// Per-level numbers for each world, for the beta report's charts: win rate (the difficulty ramp) and installs that
// started and cleared each level (the funnel). Browser-safe: no Node imports.
type RampRow = { context: { world: string; mode: string; level: number } | null; counts: Record<string, number> };
// `started` and `cleared` count installs: the game reports each once per install and level.
export type RampLevel = { level: number; wins: number; deaths: number; rate: number | null; started: number; cleared: number };
export type RampWorld = { world: string; levels: RampLevel[] };
// Campaign levels only, every build and content revision in the selection pooled together.
// Worlds keep the order of `rows` (the report's sort); levels run from 1 to the highest one reported, gaps included.
export function difficultyRamp(rows: RampRow[]): RampWorld[] {
  const worlds = new Map<string, Map<number, { wins: number; deaths: number; started: number; cleared: number }>>();
  for (const { context, counts } of rows) {
    if (!context || context.mode !== 'campaign') continue;
    const levels = worlds.get(context.world) ?? new Map(); worlds.set(context.world, levels);
    const level = levels.get(context.level) ?? { wins: 0, deaths: 0, started: 0, cleared: 0 }; levels.set(context.level, level);
    level.wins += counts['outcome.win'] ?? 0; level.deaths += counts['outcome.death'] ?? 0;
    level.started += counts['milestone.level_started'] ?? 0; level.cleared += counts['milestone.level_cleared'] ?? 0;
  }
  return [...worlds].map(([world, levels]) => ({
    world,
    levels: Array.from({ length: Math.max(...levels.keys()) }, (_, i) => {
      const { wins, deaths, started, cleared } = levels.get(i + 1) ?? { wins: 0, deaths: 0, started: 0, cleared: 0 };
      return { level: i + 1, wins, deaths, rate: wins + deaths ? wins / (wins + deaths) : null, started, cleared };
    }),
  }));
}
