# Double Putt site

The marketing site for **Double Putt**, a mini golf puzzle game for iPhone, served at **doubleputt.app**. The game
itself is a native iOS app in its own repository (`kraigstrong/double-putt`); this is only its website. Its analytics
backend and stats report stay on brightbench.app (`apps/marketing`, `/api/double-putt/*` and `/doubleputt/stats`),
since the game posts there.

| Page | What it's for |
| --- | --- |
| `/` | The pitch: a gameplay loop, a swing in three steps, the nine courses, the trailer |
| `/support` | FAQ and the support email (the App Store listing's Support URL) |
| `/privacy` | The privacy policy (the App Store listing's Privacy Policy URL, and the game's Settings link) |

brightbench.app's old addresses for these pages (`/doubleputt/...`, and before that `/double-putt/...`) redirect here,
so the links in the App Store listing and in builds already out keep working.

## Running it

```sh
npm run dev -w double-putt-site      # http://localhost:3000
npm run verify -w double-putt-site   # typecheck, lint, tests, production build
```

## Words and settings

What the site says about the game is in `src/lib/site.ts`. It follows the game's wording: a hole is two greens side by
side, never a pair, never "hole A" and "hole B" (a test checks).

- **The button** says "Coming soon to iPhone" until `testFlightUrl` in `src/lib/site.ts` is set (then "Join the beta"
  too), and becomes Apple's App Store badge once `appStoreUrl` is.
- `NEXT_PUBLIC_SITE_ORIGIN` overrides the canonical origin (see `.env.example`); production falls back to
  `https://doubleputt.app`.

## Media

Everything in `public/` is real play, recorded from the game a frame at a time, HUD and all, by its capture tools. In
kraigstrong/double-putt, `Tools/capture/site.sh <this repo>/apps/double-putt-site/public` makes every file: the hero
loop, a loop per course, the three stills, the trailer (portrait, with the game's sounds), its poster, the icon and the
link preview. Rerun it after re-recording, or once the trailer has its music.

Apple's rules for its badge and device imagery: use the official badge unmodified, at least 40pt tall, only once the
app is on the App Store; don't draw Apple devices or use the Apple logo.
