// The Open Water (Bigger Fish's endless run) and the pearl shop: what the game reports about them, and the report's
// view of it. Browser-safe: no Node imports. Keep in sync with ArcadeAnalytics.swift and ArcadeMetrics.swift.

// Where the pearl shop was opened from: the world map's pearl button, or the Shop button on an Open Water run's card.
export const shopSources = ['map', 'run_card'] as const;
export type ShopSource = typeof shopSources[number];
// A look's ID, as the game saves it: its kind, a dot, and a name (`hat.cone`). Never renamed, so counts by ID last.
export const lookId = /^[a-z]{1,16}\.[a-z0-9-]{1,40}$/;
// A run's levels are counted where it ended; levels past this one are counted together, as this one.
export const openWaterLevelCap = 60;
// The run's worlds in turn, a time round each stage, and the campaign level the first stage's are made like (the
// game's GameTuning.openWaterWorlds and openWaterFirstLevel). If the game changes either, it bumps its Open Water
// revision; update these to label the newer revision's levels.
export const openWaterWorlds = ['shallow-reef', 'jelly-bloom', 'kelp-forest', 'sunset-cove', 'midnight-zone'];
export const openWaterFirstLevel = 5;
// Histogram upper bounds for a run's fish eaten (its score), pearls, and game seconds; a run's slowest level plan in
// seconds; pearls in hand when the shop opened.
export const openWaterBuckets = {
  fish: [0,5,10,15,20,25,30,40,50,60,75,100,150,200,300,500,10000],
  pearls: [0,1,2,3,5,8,12,16,20,30,40,60,100,10000],
  seconds: [30,60,120,180,240,300,450,600,900,1200,1800,3600],
  plan: [.1,.25,.5,1,2,3,5,10,20,60,600],
  wallet: [0,10,25,50,75,100,150,200,300,500,1000,2000,100000],
};

// The run's `level`th level (from 1): its world and the campaign level it's made like.
export function openWaterLeg(level: number) {
  const index = level - 1, stage = Math.floor(index / openWaterWorlds.length) + 1;
  return { world: openWaterWorlds[index % openWaterWorlds.length]!, difficulty: openWaterFirstLevel + stage - 1 };
}

type Row = { context: { world: string; mode: string; revision: string } | null; counts: Record<string, number> };
export type OpenWaterLevel = {
  level: number; world: string; difficulty: number;
  // Runs that reached this level, and that ended on it, by how (a cause of death, or quit or abandoned).
  reached: number; ended: number; endings: Record<string, number>;
  // Of the runs that reached it, the share that ended on it. The last level (`openWaterLevelCap`) holds every run
  // that got that far, so it's always 100%.
  rate: number | null;
};
export type Histogram = { bound: number; runs: number }[];
export type OpenWaterReport = {
  revisions: string[];
  runs: number; outcomes: Record<'death' | 'quit' | 'abandoned', number>; deaths: Record<string, number>;
  levels: OpenWaterLevel[];
  fish: Histogram; pearls: Histogram; seconds: Histogram;
  // Means over every run, whatever its outcome (game seconds for `seconds`).
  mean: { fish: number | null; pearls: number | null; seconds: number | null; levels: number | null };
  best: number;
  // Runs by how many levels waited on the next one to be planned, and by the run's slowest plan.
  planWaits: Histogram; slowestPlan: Histogram; waitSeconds: number;
  dressed: number; plain: number;
  // What players did after a run they lost.
  after: { retry: number; leave: number; unknown: number };
  // Installs: their first run, and their first time round all five worlds.
  installs: { started: number; round: number };
};
const outcomes = ['death', 'quit', 'abandoned'] as const;
function histogram(counts: Record<string, number>, prefix: string, bounds: number[]): Histogram {
  return bounds.map(bound => ({ bound, runs: counts[`${prefix}${bound}`] ?? 0 }));
}
// Every Open Water row in the selection (every build) pooled, of one Open Water revision if `revision` is given.
export function openWaterReport(rows: Row[], revision?: string): OpenWaterReport {
  const endless = rows.filter(r => r.context?.mode === 'endless');
  const revisions = [...new Set(endless.map(r => r.context!.revision))].sort().reverse();
  const counts: Record<string, number> = {};
  for (const r of endless) {
    if (revision && r.context!.revision !== revision) continue;
    for (const [field, n] of Object.entries(r.counts)) counts[field] = (counts[field] ?? 0) + n;
  }
  const sum = (prefix: string) => Object.entries(counts).filter(([f]) => f.startsWith(prefix)).reduce((a, [, n]) => a + n, 0);
  const runs = outcomes.reduce((a, o) => a + (counts[`outcome.${o}`] ?? 0), 0);
  const endedAt = new Map<number, Record<string, number>>();
  for (const [field, n] of Object.entries(counts)) {
    const match = /^ended\.(\d+)\.(.+)$/.exec(field);
    if (!match) continue;
    const level = Number(match[1]), endings = endedAt.get(level) ?? {};
    endings[match[2]!] = (endings[match[2]!] ?? 0) + n; endedAt.set(level, endings);
  }
  const deepest = Math.max(0, ...endedAt.keys());
  let reached = [...endedAt.values()].reduce((a, e) => a + Object.values(e).reduce((x, y) => x + y, 0), 0);
  const levels: OpenWaterLevel[] = [];
  for (let level = 1; level <= deepest; level++) {
    const endings = endedAt.get(level) ?? {}, ended = Object.values(endings).reduce((a, b) => a + b, 0);
    levels.push({ level, ...openWaterLeg(level), reached, ended, endings, rate: reached ? ended / reached : null });
    reached -= ended;
  }
  // Sums are thousandths, as the game's counters are sent.
  const mean = (field: string) => runs ? outcomes.reduce((a, o) => a + (counts[`sum.${o}.${field}`] ?? 0), 0) / 1000 / runs : null;
  const levelsCleared = levels.reduce((a, l) => a + l.ended * (l.level - 1), 0);
  return {
    revisions, runs,
    outcomes: { death: counts['outcome.death'] ?? 0, quit: counts['outcome.quit'] ?? 0, abandoned: counts['outcome.abandoned'] ?? 0 },
    deaths: Object.fromEntries(Object.entries(counts).filter(([f]) => f.startsWith('death.')).map(([f, n]) => [f.slice(6), n])),
    levels,
    fish: histogram(sumOutcomes(counts, 'hist', 'fish'), '', openWaterBuckets.fish),
    pearls: histogram(sumOutcomes(counts, 'hist', 'pearls'), '', openWaterBuckets.pearls),
    seconds: histogram(sumOutcomes(counts, 'hist', 'seconds'), '', openWaterBuckets.seconds),
    mean: { fish: mean('fish'), pearls: mean('pearls'), seconds: mean('seconds'), levels: runs ? levelsCleared / runs : null },
    best: counts.best ?? 0,
    planWaits: histogram(counts, 'planWaits.', [0,1,2,3,5,10,20,50,100,500,10000]),
    slowestPlan: histogram(counts, 'slowestPlan.', openWaterBuckets.plan),
    waitSeconds: (counts['sum.planWaitSeconds'] ?? 0) / 1000,
    dressed: sum('dressed.'), plain: sum('plain.'),
    after: { retry: counts['decision.death.retry'] ?? 0, leave: counts['decision.death.leave'] ?? 0, unknown: counts['decision.death.unknown'] ?? 0 },
    installs: { started: counts['milestone.open_water_started'] ?? 0, round: counts['milestone.open_water_round'] ?? 0 },
  };
}
// A histogram's buckets, every outcome's added together: `hist.death.fish.20` and `hist.quit.fish.20` as `20`.
function sumOutcomes(counts: Record<string, number>, kind: string, field: string) {
  const out: Record<string, number> = {};
  for (const o of outcomes) {
    const prefix = `${kind}.${o}.${field}.`;
    for (const [f, n] of Object.entries(counts)) if (f.startsWith(prefix)) out[f.slice(prefix.length)] = (out[f.slice(prefix.length)] ?? 0) + n;
  }
  return out;
}

export type ShopReport = {
  visits: Record<ShopSource, number>;
  // Visits that bought at least one look.
  buyingVisits: Record<ShopSource, number>;
  // Each look reported: times bought, installs that earned it, and launches it was worn on.
  looks: { id: string; bought: number; earned: number; worn: number }[];
  wallet: Histogram;
  // Installs' first purchase, by Open Water runs finished before it.
  firstPurchaseRuns: Histogram;
  // Launches whose first run was played dressed (each reports its outfit once).
  outfits: number;
  // Runs played dressed and plain: campaign and Open Water.
  dressed: { campaign: { dressed: number; plain: number }; openWater: { dressed: number; plain: number } };
};
export function shopReport(rows: Row[]): ShopReport {
  const install: Record<string, number> = {};
  const dressed = { campaign: { dressed: 0, plain: 0 }, openWater: { dressed: 0, plain: 0 } };
  for (const { context, counts } of rows) {
    if (context) {
      const into = context.mode === 'endless' ? dressed.openWater : dressed.campaign;
      for (const [field, n] of Object.entries(counts)) {
        if (field.startsWith('dressed.')) into.dressed += n;
        else if (field.startsWith('plain.')) into.plain += n;
      }
      continue;
    }
    for (const [field, n] of Object.entries(counts)) install[field] = (install[field] ?? 0) + n;
  }
  const looks = new Map<string, { id: string; bought: number; earned: number; worn: number }>();
  for (const [field, n] of Object.entries(install)) {
    const match = /^look\.(bought|earned|worn)\.(.+)$/.exec(field);
    if (!match) continue;
    const look = looks.get(match[2]!) ?? { id: match[2]!, bought: 0, earned: 0, worn: 0 };
    look[match[1] as 'bought' | 'earned' | 'worn'] += n; looks.set(look.id, look);
  }
  const bySource = (prefix: string) => Object.fromEntries(shopSources.map(s => [s, install[`${prefix}${s}`] ?? 0])) as Record<ShopSource, number>;
  return {
    visits: bySource('shop.visit.'), buyingVisits: bySource('shop.buyingVisit.'),
    looks: [...looks.values()].sort((a, b) => b.bought - a.bought || b.earned - a.earned || b.worn - a.worn || a.id.localeCompare(b.id)),
    wallet: histogram(install, 'shop.wallet.', openWaterBuckets.wallet),
    firstPurchaseRuns: histogram(install, 'shop.firstPurchaseRuns.', [0,1,2,3,5,10,20,50,100,500,10000]),
    outfits: install['look.outfits'] ?? 0,
    dressed,
  };
}
