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
