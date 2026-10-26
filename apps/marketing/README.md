# Marketing

Next.js App Router marketing site for the BrightBench app suite.

## SEO / indexing checklist

After deploy:

1. Set **`NEXT_PUBLIC_SITE_ORIGIN`** on Vercel to the canonical marketing URL (no trailing slash). This drives `metadataBase`, `sitemap.xml`, and `robots.txt` sitemap hints.
2. Open **`/robots.txt`** and **`/sitemap.xml`** on the live domain and confirm URLs are absolute and correct.
3. In Google Search Console: add the property, submit the sitemap URL (`https://<your-domain>/sitemap.xml`), and use URL Inspection on `/products/time-tutor` and `/learn/time-telling-games`.
4. Optional: validate a few pages with [Rich Results Test](https://search.google.com/test/rich-results) (FAQ + product JSON-LD where present).

Local quick check:

```bash
npm run dev -w marketing
# Visit http://localhost:3000/robots.txt and http://localhost:3000/sitemap.xml
```

## Time Tutor links

- **App Store:** `NEXT_PUBLIC_TIME_TUTOR_APP_STORE_URL` (falls back to the default listing in `src/lib/site.ts`).

## Math Reef analytics

Math Reef (the iOS app in `kraigstrong/bigger-fish`) posts anonymous usage counts to
`POST /api/math-reef/events`, and `GET /api/math-reef/stats` sums them. Validation and counting live
in `src/lib/math-reef-analytics.ts`, with tests in `test/math-reef-analytics.test.ts`. Only counters
are stored, per UTC day, channel, and app version: never a payload or an IP address. Don't add
request logging to these routes.

Environment variables (Vercel project settings; locally in `apps/marketing/.env.local`, which git
ignores):

- `KV_REST_API_URL`, `KV_REST_API_TOKEN`: Upstash Redis, set by the Vercel Marketplace integration.
- `MATH_REEF_APP_KEY`: must match `ReefAnalytics.appKey` in the app. A bot filter, not a secret.
- `MATH_REEF_STATS_SECRET`: a real secret for reading stats. Never put it in an app.

At most 20 distinct `channel:appVersion` builds are counted per day (`maxBuildsPerDay`); a new
build past that gets a 429. That bounds what anyone holding the public app key can make us store.

Rate limiting is a Vercel Firewall rule on `/api/math-reef/events`, configured in the Vercel
dashboard rather than in code.

When Math Reef adds a level, add its ID to `levelIds` before that app version ships.

```bash
curl -s "https://brightbench.app/api/math-reef/stats?from=2026-10-01&to=2026-10-31" \
  -H "Authorization: Bearer $MATH_REEF_STATS_SECRET"
```

## Bigger Fish gameplay diagnostics

The native app posts schema-1 summaries to `POST /api/bigger-fish/events`.
`GET /api/bigger-fish/stats` and `/bigger-fish/stats` provide protected aggregate reporting;
`/bigger-fish/privacy` describes the contract. The app has collection disabled until deployment
and disclosures are validated. This backend does not change Math Reef's routes or policy.

Configuration:

- Existing `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`).
- `BIGGER_FISH_APP_KEY`: match the native public noise filter, `bigger-fish-gameplay-v1`.
  This is not authentication; strict validation and bounded cardinality still apply.
- `BIGGER_FISH_STATS_SECRET`: independent private reporting secret, never shipped in the app.

Requests and storage are bounded: 64 KiB bodies, 25 events/batch, 20 builds, 500 build/content
pairs and 20,000 counter fields total per receive-day. Redis enforces all caps atomically
before writing any part of a batch; reusing a context in another build consumes another pair. Only daily
counters/sums/histograms and content/build indexes are stored, never raw run records or IDs.
Keys expire 90 days after their day's last accepted write. No request/error-body logging in either
route. Configure Vercel rate limiting on the event route before activating app collection; review
provider-level operational logs separately from application code.

World IDs are bounded slugs rather than a fixed catalog. Mode supports campaign/endless, and slots
and setup indices support large generated campaigns. Canonical seed is a decimal string so future
64-bit seeds do not lose precision in JSON. Daily caps constrain ingestion/storage, not gameplay;
metrics beyond those caps are dropped. Build, content revision, slot, setup and seed stay distinct.
New optional diagnostic fields should be allowlisted server-first; schema-1 old clients remain
accepted. Use a new schema version for incompatible meanings; do not permit arbitrary metadata.

The paywall funnel (bigger-fish#123, behind the app's `ArcadeAnalytics.sendsPaywallEvents`) adds
three context-free kinds counted under the `install` token: `offer` (`source`, `first`), `purchase`
(`outcome`, `source`) and `restore` (`outcome`, `source`, which may also be `settings`). Sources and
outcomes are fixed lists in `src/lib/bigger-fish-paywall.ts`. It also adds the `world_conquered`
milestone (a world's tenth level first cleared) and an optional `unlocked` boolean on runs, counted
as `free.<outcome>` / `unlocked.<outcome>` per level. The report's "The unlock" section pools them.

The Open Water and the pearl shop (behind the app's `ArcadeAnalytics.sendsOpenWaterEvents`) add four kinds, all
listed in `src/lib/bigger-fish-open-water.ts`:

- `endless`: one per Open Water run, with an `openWater` summary (levels cleared, fish, pearls, game seconds, a new
  best, levels that waited on the next plan and for how long, the slowest plan, dressed). Its context is the same for
  every run (world `open-water`, mode `endless`, seed `"0"`, the game's Open Water revision), so runs share one
  content row however many there are: a run's own seed would open a row per run and hit the daily pair cap. A run is
  counted only where it ended (`ended.<level>.<cause or quit/abandoned>`, levels capped at 60); the report adds up
  the runs reaching each level from those, and takes the mean levels cleared from their own uncapped sum. `decision` (retry/leave) and the milestones `open_water_started` and
  `open_water_round` reuse the endless context.
- `shop` (a visit: `source`, `wallet`, `bought` look IDs, `firstPurchaseRuns` on the install's first purchase),
  `earned` (`id`, once per install) and `outfit` (`pieces`, one per kind, once per launch): context-free, under the
  `install` token. The outfit is counted piece by piece (`look.worn.<id>`); the combination is never kept.
- An optional `dressed` boolean on campaign runs, counted as `dressed.<outcome>` / `plain.<outcome>`.

The report's "The Open Water" and "The pearl shop and looks" sections pool them; the campaign's charts and table
leave Open Water rows out.

**Cost.** Upstash bills the script call plus every `redis.call` in it. A write costs about 5 commands plus one
`HINCRBY` per counter: the cap checks are one `SISMEMBER`, one `SMISMEMBER` and one `GET`, and one `HLEN` counts the
build's counters before. The rest (`SCARD`, `SADD`, a second `HLEN` and `INCRBY` for new counters, `EXPIRE`, and an
exact `HEXISTS` count near the field cap) runs only when something is new to the day. New counters are counted from the
hash's size, not from increments that return themselves, since writes from before zero increments were dropped left
some counters at 0. `counterUpdates` drops zero increments. The app sends in batches (when 25 events are waiting, on going to the
background, and at launch), and identical counters in a batch merge into one increment.

The report defaults to TestFlight and the last 30 receive-days. Optional query parameters:
`from`, `to` (up to 90 days), `channel`, `appVersion`, `build`. Read credentials use only the
Authorization header; the web report holds its key in component memory, not a URL/local storage.
Raw detailed report counters show outcome-specific sums scaled by 1,000 and upper-bound histogram
buckets. Success rate is wins/(wins+deaths); all-ended rate also includes quits/abandoned. Unknown
growth snapshots are shown separately. First-clear histograms describe successful installs only;
consult progression starts and unresolved attempts rather than treating those histograms as an
unbiased player-difficulty estimate. Percentiles can be estimated from buckets, not exact runs.
A positive growth budget ignores geometry, hazards and AI's future choices; no path in a frozen
snapshot is not conclusive unwinnability. Never automatically tune levels from these summaries.

Before activation: merge/deploy the reviewed backend and policy, configure keys/Redis/rate limits,
validate synthetic traffic and protected reads, inspect provider logging/retention settings, update
App Store disclosures, then explicitly enable the native client and verify a physical TestFlight
build. No production data or deployment is needed for local contract tests.

Storage limiter regressions execute the production Lua script against an in-memory Redis command
shim: `node test/run-bigger-fish-redis.mjs` from `apps/marketing`. The runner uses a temporary
Fengari interpreter through npm exec and does not modify dependencies or connect to Redis.
This checks script behavior; live Upstash validation remains a release check.

## Double Putt's site

`/doubleputt` is Double Putt's own site, in the spirit of biggerfish.app: the pitch (a gameplay loop, a swing in three
steps, the nine courses, the trailer), `/doubleputt/support` (the App Store listing's Support URL), and
`/doubleputt/privacy` (its Privacy Policy URL, and the game's Settings link). The old `/double-putt/...` addresses
redirect there. The pages live in `app/doubleputt/(site)/`, whose layout steps out of the root layout's centred column
to fill the window in the game's own colors; its words and settings are `src/lib/double-putt-site.ts`, and its
components `src/components/double-putt/`. They follow the game's wording: a hole is two greens side by side, never a
pair, never "hole A" and "hole B".

- **The button** says "Coming soon to iPhone" until `testFlightUrl` in `src/lib/double-putt-site.ts` is set (then
  "Join the beta" too), and becomes Apple's App Store badge once `appStoreUrl` is.
- **Media** (`public/doubleputt/`) is all real play, recorded from the game a frame at a time, HUD and all, by its
  capture tools. In kraigstrong/double-putt, `Tools/capture/site.sh <this repo>/apps/marketing/public/doubleputt`
  makes every file: the hero loop, a loop per course, the three stills, the trailer (portrait, with the game's
  sounds), its poster, the icon and the link preview. Rerun it after re-recording, or once the trailer has its music.

## Double Putt gameplay analytics

Double Putt (the mini golf puzzle game, kraigstrong/double-putt; client in `MiniGolf/Game/Analytics.swift`) posts
anonymous schema-2 batches to `POST /api/double-putt/events`. The contract is `docs/analytics.md` in that repo: change
both together. `GET /api/double-putt/stats` and `/doubleputt/stats` provide protected aggregate reporting;
`/doubleputt/privacy` is the app's privacy policy (see Double Putt's site, above). Logic and validation live in
`src/lib/double-putt-analytics.ts`, storage in `src/lib/double-putt-redis.ts` (keys under `dp:v1:`), tests in
`test/double-putt-analytics.test.ts`. It is a copy of the Bigger Fish backend above, with the same safeguards and caps.

Configuration:

- Existing `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`).
- `DOUBLE_PUTT_APP_KEY`: match `Analytics.appKey` in the app, `double-putt-gameplay-v1`. A noise filter, not
  authentication; strict validation and bounded cardinality still apply.
- `DOUBLE_PUTT_STATS_SECRET`: independent private reporting secret, never shipped in the app.

Three event kinds: `milestone` (`first_launch`, `course_unlocked`, `hole_finished`, `trophy_won`), `hole` (one per
attempt) and `round` (`started`, `left`, `finished`). A batch with any field or value the contract doesn't allow is
rejected whole (400). Counters are kept per build (`channel:appVersion:build`) and content: each hole at a course
revision, each course at a revision, and the install, so a revision bump never mixes two versions of a hole. Courses
and hole slugs are bounded patterns, not a list: a new course needs no server change. Limits are Bigger Fish's: 64 KiB
bodies, 25 events/batch, 20 builds, 500 build/content pairs and 20,000 counter fields per receive-day, enforced
atomically before any write; keys expire 90 days after their day's first write. Zero sums are not written.
Upstash bills the script call plus every `redis.call` in it, so the script checks the caps with one `SISMEMBER`, one
`SMISMEMBER` and one `GET`, and runs `SCARD`, `SADD`, `INCRBY` and `EXPIRE` only when something is new to the day (and
an exact `HEXISTS` count only near the field cap), and one `HLEN` counts the build's counters before the write (and
after it when one may be new): a write costs about 5 commands plus one `HINCRBY` per counter.
TestFlight builds 1–3 send schema 1, which called a hole a pair (`kind: "pair"`, `context.pair`, `pair_finished`,
`pair` on a round left); it's still accepted, one schema per batch, and renamed on arrival so both count together.
Counters from before that write a first finish as `milestone.pair_finished`, which the report adds to
`milestone.hole_finished` until they expire.

The report pools every build in the selection (filter by `build` or `appVersion` to compare) and keeps revisions
apart. Strokes over par, at-or-under-par, green strokes and tries (mean, and a median from the `attempt.*` buckets)
count first finishes, not replays, which are mostly trophy chasing; all-finish figures are shown beside them. A hole
writes at most about 40 counter fields per build, so the 20,000-field cap and the 500-content cap both allow about
eight builds' worth of all six courses a day. Query parameters as for Bigger Fish: `from`, `to` (up to 90 days), `channel` (default
`testflight`), `appVersion`, `build`.

Configure Vercel rate limiting on `/api/double-putt/events` before a build with collection on reaches testers. No
request or error logging in these routes. Storage limiter regressions: `node test/run-double-putt-redis.mjs` from
`apps/marketing`, as for Bigger Fish.

```bash
curl -s "https://brightbench.app/api/double-putt/stats?from=2026-10-01&to=2026-10-31" \
  -H "Authorization: Bearer $DOUBLE_PUTT_STATS_SECRET"
```

## Apex lap service

Apex (the one-touch racer, kraigstrong/apex-rivals; client in `Apex/ApexOnline.swift`) uses six routes. Logic and validation live in
`src/lib/apex-laps.ts`, Game Center identity checks in `src/lib/apex-identity.ts`, storage in `src/lib/apex-redis.ts`,
tests in `test/apex-laps.test.ts`. Everything is per **board**: a circuit at one revision, driven with one physics
version (`ardennes.r1.p1`), because lap times only compare within one. Only the boards in `apexBoards`
(`src/lib/apex-laps.ts`) are accepted, so no client can make the service store anything for others: **when Apex adds
a circuit, or bumps a circuit's revision or its physics version, add the board here and deploy before that app
version ships.**

- `POST /api/apex/laps`: every finished lap, in batches of up to 25. Stored only as daily counters per board (laps,
  a 250 ms lap-time histogram, wall-hit buckets), never as raw records, for 90 days. At most 50 boards a day.
- `POST /api/apex/ghosts`: a player's personal best and its ghost (~15 KB). The upload carries Game Center's identity
  verification signature, checked against Apple's certificate (`*.apple.com` over HTTPS, signed within 15 minutes;
  Apple doesn't document the timestamp's unit, so seconds are accepted as well as the milliseconds it sends),
  so nobody can post as someone else. The store keeps only a salted hash of the player, the player's public Game
  Center alias, their best time and its ghost: one per player per board, replaced only by a faster lap, along with a
  quarter-second histogram of the board's bests, updated in the same atomic script. These are the leaderboard
  itself, so they don't expire.
- `GET /api/apex/rival?track=&revision=&physics=&ms=`: a ghost that beats `ms` by 0.15–0.8 s, as close to 0.4 s as
  there is (searching outward from 0.4 s on both sides, so a crowded board can't hide the best match), never the
  asking player's own. On a board with only a few players, when nobody is in that window, the nearest player who beats
  `ms` at all, up to 3 s ahead. 204 when there's none; the app then races a bot instead.

- `GET /api/apex/standing?track=&revision=&physics=&ms=`: where a lap falls among other players' bests: how many
  beat it, of how many (the asking player's own best left out), and their spread as a histogram of at most 40 bars,
  built from the board's histogram so it counts every player. The app shows this when a session ends.
- `POST /api/apex/friends`: which of a player's Game Center friends have a best on a board, fastest first: a body of
  `{schema: 1, track, revision, physics, players}`, where `players` is up to 100 friends' tokens (below), answered with
  `{friends: [{player, ms}]}` for those who have one. The app names them from Game Center, so no alias is returned.
  Nothing is stored.
- `GET /api/apex/ghosts?track=&revision=&physics=`: one friend's best lap and ghost, named by their token in the
  `X-Apex-Friend` header, for racing them; 204 when they have none. Nothing is stored.

The rival and standing GETs learn who's asking (to leave out their own best) from the `X-Apex-Player` header: SHA-256
of `apex:` and the team player ID, so a raw ID never appears in a URL; the store only ever sees that token salted
again. Friends are named by the same token, in the friends body or the `X-Apex-Friend` header. A token only comes
from a team player ID, which Game Center shares only with this team's apps, so the friend routes answer for the
asker's Game Center friends: they show nothing that a rival or a friend's leaderboard doesn't.

Rankings themselves live in Game Center (`apex.<track>.r<revision>.p<physics>` leaderboards); this service holds what
Game Center can't: lap-time distributions and ghosts.

Configuration:

- Existing `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
- `APEX_APP_KEY`: match `ApexOnline.appKey` in the app (`apex-laps-v1`). A bot filter, not authentication.
- `APEX_PLAYER_SALT`: a real secret for hashing player IDs. Never change it once live (players' bests would split),
  and never put it in an app. Without it, ghost uploads return 503.

Configure Vercel rate limiting on all of `/api/apex/*` before the app turns the service on (`ApexOnline.isEnabled`). No
request or error logging in these routes.
