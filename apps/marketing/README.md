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
