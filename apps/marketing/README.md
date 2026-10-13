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

## Apex lap service

Apex (the one-touch racer, kraigstrong/apex-rivals; client in `Apex/ApexOnline.swift`) uses four routes. Logic and validation live in
`src/lib/apex-laps.ts`, Game Center identity checks in `src/lib/apex-identity.ts`, storage in `src/lib/apex-redis.ts`,
tests in `test/apex-laps.test.ts`. Everything is per **board**: a circuit at one revision, driven with one physics
version (`ardennes.r1.p1`), because lap times only compare within one. Only the boards in `apexBoards`
(`src/lib/apex-laps.ts`) are accepted, so no client can make the service store anything for others: **when Apex adds
a circuit, or bumps a circuit's revision or its physics version, add the board here and deploy before that app
version ships.**

- `POST /api/apex/laps`: every finished lap, in batches of up to 25. Stored only as daily counters per board (laps,
  a 250 ms lap-time histogram, wall-hit buckets), never as raw records, for 90 days. At most 50 boards a day.
- `POST /api/apex/ghosts`: a player's personal best and its ghost (~15 KB). The upload carries Game Center's identity
  verification signature, checked against Apple's certificate (`*.apple.com` over HTTPS, signed within 15 minutes),
  so nobody can post as someone else. The store keeps only a salted hash of the player, the player's public Game
  Center alias, their best time and its ghost: one per player per board, replaced only by a faster lap, along with a
  quarter-second histogram of the board's bests, updated in the same atomic script. These are the leaderboard
  itself, so they don't expire.
- `GET /api/apex/rival?track=&revision=&physics=&ms=`: a ghost that beats `ms` by 0.15–0.8 s, as close to 0.4 s as
  there is (searching outward from 0.4 s on both sides, so a crowded board can't hide the best match), never the
  asking player's own. 204 when there's none; the app then races a bot instead.

- `GET /api/apex/standing?track=&revision=&physics=&ms=`: where a lap falls among other players' bests: how many
  beat it, of how many (the asking player's own best left out), and their spread as a histogram of at most 40 bars,
  built from the board's histogram so it counts every player. The app shows this when a session ends.

The two GETs learn who's asking (to leave out their own best) from the `X-Apex-Player` header: SHA-256 of `apex:`
and the team player ID, so a raw ID never appears in a URL; the store only ever sees that token salted again.

Rankings themselves live in Game Center (`apex.<track>.r<revision>.p<physics>` leaderboards); this service holds what
Game Center can't: lap-time distributions and ghosts.

Configuration:

- Existing `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
- `APEX_APP_KEY`: match `ApexOnline.appKey` in the app (`apex-laps-v1`). A bot filter, not authentication.
- `APEX_PLAYER_SALT`: a real secret for hashing player IDs. Never change it once live (players' bests would split),
  and never put it in an app. Without it, ghost uploads return 503.

Configure Vercel rate limiting on all four routes before the app turns the service on (`ApexOnline.isEnabled`). No
request or error logging in these routes.
