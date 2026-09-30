import { levelIds, worldIds } from './math-reef-ids.ts';

// Turns the summed counters from GET /api/math-reef/stats into what the dashboard shows: per-world
// funnels in curriculum order, with how rounds ended and where kids stopped.

export type StatsResponse = {
  from: string;
  to: string;
  channel: string;
  appVersion: string;
  milestones: Record<string, number>;
  rounds: Record<string, number>;
};

/** A point where quit or abandoned rounds ended: `correct` answers out of `target`. */
export type StopPoint = { correct: number; target: number; count: number };

export type LevelRow = {
  level: string;
  /** Players who started or passed the level (milestones are once per install). */
  started: number;
  passed: number;
  /** passed / started, or null before anyone has started. */
  passRate: number | null;
  finished: number;
  quit: number;
  abandoned: number;
  /** Mean stars over finished rounds, or null with none. */
  averageStars: number | null;
  /** Most common stopping points for quit and abandoned rounds, most frequent first (up to 3). */
  stopPoints: StopPoint[];
};

export type WorldSummary = {
  world: (typeof worldIds)[number];
  silver: number;
  gold: number;
  levels: LevelRow[];
};

export type Dashboard = {
  installs: number;
  firstRounds: number;
  rounds: number;
  worlds: WorldSummary[];
};

const worldByPrefix: Record<string, (typeof worldIds)[number]> = {
  add: 'addition',
  sub: 'subtraction',
  mul: 'multiplication',
  div: 'division',
  exp: 'exponents',
};

export const worldTitles: Record<(typeof worldIds)[number], string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  exponents: 'Exponents',
};

type Tally = {
  finished: number;
  quit: number;
  abandoned: number;
  stars: number;
  stops: Map<string, StopPoint>;
};

export function summarize(stats: Pick<StatsResponse, 'milestones' | 'rounds'>): Dashboard {
  const milestone = (name: string) => stats.milestones[name] ?? 0;

  const tallies = new Map<string, Tally>();
  let rounds = 0;
  for (const [field, count] of Object.entries(stats.rounds)) {
    // `level|outcome|correct|target|stars` (see counterUpdates in math-reef-analytics.ts).
    const [level, outcome, correctText, targetText, starsText] = field.split('|');
    if (!level || !outcome) continue;
    const tally = tallies.get(level) ?? { finished: 0, quit: 0, abandoned: 0, stars: 0, stops: new Map() };
    rounds += count;
    if (outcome === 'finished') {
      tally.finished += count;
      tally.stars += Number(starsText) * count;
    } else if (outcome === 'quit' || outcome === 'abandoned') {
      tally[outcome] += count;
      const key = `${correctText}/${targetText}`;
      const stop = tally.stops.get(key) ?? { correct: Number(correctText), target: Number(targetText), count: 0 };
      stop.count += count;
      tally.stops.set(key, stop);
    }
    tallies.set(level, tally);
  }

  const worlds = worldIds.map((world): WorldSummary => ({
    world,
    silver: milestone(`crown:${world}:silver`),
    gold: milestone(`crown:${world}:gold`),
    levels: levelIds
      .filter((level) => worldByPrefix[level.split('.')[0]!] === world)
      .map((level): LevelRow => {
        const started = milestone(`level_started:${level}`);
        const passed = milestone(`level_passed:${level}`);
        const tally = tallies.get(level);
        return {
          level,
          started,
          passed,
          passRate: started > 0 ? passed / started : null,
          finished: tally?.finished ?? 0,
          quit: tally?.quit ?? 0,
          abandoned: tally?.abandoned ?? 0,
          averageStars: tally && tally.finished > 0 ? tally.stars / tally.finished : null,
          stopPoints: tally
            ? [...tally.stops.values()]
                .sort((a, b) => b.count - a.count || a.correct - b.correct)
                .slice(0, 3)
            : [],
        };
      }),
  }));

  return { installs: milestone('first_launch'), firstRounds: milestone('first_round'), rounds, worlds };
}
