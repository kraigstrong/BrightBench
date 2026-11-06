// The games brightbench.app/stats has a tab for, in tab order. `/stats?game=<id>` opens one; the old per-game
// stats pages redirect there (next.config.ts).

export const statsGames = [
  { id: 'bigger-fish', name: 'Bigger Fish' },
  { id: 'double-putt', name: 'Double Putt' },
  { id: 'apex', name: 'Ghost Thread' },
  { id: 'math-reef', name: 'Math Reef' },
] as const;

export type StatsGameId = (typeof statsGames)[number]['id'];

/** The tab `/stats` opens on without a valid `?game=`. */
export const defaultStatsGame: StatsGameId = 'bigger-fish';

/** A `?game=` value as a game's id. Anything else (missing, repeated, unknown, differently cased) is the default. */
export function parseStatsGame(value: string | string[] | null | undefined): StatsGameId {
  return statsGames.find((game) => game.id === value)?.id ?? defaultStatsGame;
}
