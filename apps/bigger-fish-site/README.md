# Bigger Fish site

The marketing site for **Bigger Fish**, a one-touch arcade game for iPhone, served at **biggerfish.app**. The game
itself is a native iOS app in its own repository (`kraigstrong/bigger-fish`); this is only its website.

| Page | What it's for |
| --- | --- |
| `/` | The pitch: a gameplay loop, the three beats of the game, its four worlds, the trailer |
| `/press` | The press kit: fact sheet, descriptions, trailer and gameplay loops, screenshots, logos, key art, and a zip of everything. This is the link for Apple featuring nominations. |
| `/support` | FAQ and the support email (the App Store listing's Support URL) |
| `/privacy` | The privacy policy (the App Store listing's Privacy Policy URL) |

## Running it

```sh
npm run dev -w bigger-fish-site      # http://localhost:3000
npm run verify -w bigger-fish-site   # typecheck, lint, tests, production build
```

`npm run press-kit` (run automatically before `dev` and `build`) packs `public/press/bigger-fish-press-kit.zip`
from the files listed in `src/lib/press-assets.ts`. The zip is generated, never committed.

## Launch day

Everything that changes at launch is an environment variable (see `.env.example`):

- `NEXT_PUBLIC_BIGGER_FISH_APP_STORE_URL` swaps "Coming soon to iPhone" for Apple's App Store badge (and adds
  Apple's trademark line to the footer). With `NEXT_PUBLIC_BIGGER_FISH_PREORDER=true` it shows a pre-order link
  instead, since Apple doesn't host its pre-order badge.
- `NEXT_PUBLIC_BIGGER_FISH_APP_STORE_ID` adds Safari's Smart App Banner.
- `NEXT_PUBLIC_BIGGER_FISH_TESTFLIGHT_URL` adds a "Join the beta" button before launch.

## Media

- `public/media/bigger-fish-trailer.mp4`: the gameplay trailer.
- `public/media/hero.mp4`, `public/media/worlds/*.mp4`, and `public/screenshots/*.png`: rendered straight from the
  game's SpriteKit scenes at iPhone 17 Pro resolution (2622 × 1206) with the interface hidden, by a scratch Xcode
  test that plays each level with a simple bot. They show real levels, not mock-ups.
- `public/press/`: the app icon, wordmarks (Avenir Next Heavy, the game's typeface), and key art.

Apple's rules for its badge and device imagery: use the official badge unmodified, at least 40pt tall, only once
the app is on the App Store; don't draw Apple devices or use the Apple logo.
