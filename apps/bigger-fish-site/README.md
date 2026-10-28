# Bigger Fish site

The marketing site for **Bigger Fish**, a one-touch arcade game for iPhone and iPad, served at **biggerfish.app**. The game
itself is a native iOS app in its own repository (`kraigstrong/bigger-fish`); this is only its website.

| Page | What it's for |
| --- | --- |
| `/` | The pitch: a gameplay loop, the three beats of the game, its two ways to play (Adventure's five worlds and the Open Water), the trailer |
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

- `NEXT_PUBLIC_BIGGER_FISH_APP_STORE_URL` swaps "Coming to iPhone and iPad <release day>" for Apple's App Store badge (and adds
  Apple's trademark line to the footer). With `NEXT_PUBLIC_BIGGER_FISH_PREORDER=true` it shows a pre-order link
  instead, since Apple doesn't host its pre-order badge.
- `NEXT_PUBLIC_BIGGER_FISH_APP_STORE_ID` adds Safari's Smart App Banner.
- `NEXT_PUBLIC_BIGGER_FISH_TESTFLIGHT_URL` adds a "Join the beta" button before launch. It has no default: the
  public group the site used to link (Marketing site) stopped getting builds at 1.0, and the site describes 1.1.

## Media

- `public/media/bigger-fish-trailer.mp4`: the 1.1 trailer (1920 × 886, 60 fps, 0:30, with the game's music): the
  core loop, Adventure's worlds, an Open Water run, and the pearl shop. Every shot is real play, recorded from the
  game a frame at a time (`scripts/bigger-fish-trailer.sh` in kraigstrong/bigger-fish builds it, as
  `build/trailer/bigger-fish-trailer.mp4`), with captions in Avenir Next. The same cut at 30 fps, without the release
  date, is the App Store preview. `trailer-poster.jpg` is its frame at 0:06.
- `public/media/modes/open-water.mp4` and `pearl-shop.mp4`, beside the Open Water on the home page: cut from the
  trailer's footage (`build/footage/` after the script above), 1280 × 588 like the world loops. The Open Water's is
  `open-water.1003-collector-16.5-21.5` (a run crossing from Shallow Reef into Jelly Bloom), cropped clear of the
  fish and pearl counts at the top; the pearl shop's is `shop-tour` from 2.8 s, cropped clear of the camera cutout.
- `public/media/hero.mp4`, `public/media/worlds/shallow-reef.mp4`, and the Shallow Reef and Jelly Bloom screenshots:
  rendered straight from the game's SpriteKit scenes at iPhone 17 Pro resolution (2622 × 1206) with the interface
  hidden, by a scratch Xcode test that plays each level with a simple bot. They show real levels, not mock-ups.
- Kelp Forest's and Midnight Zone's loops and screenshots, with the kelp's bubbles and Midnight Zone's lure: from the
  game's own scripts in kraigstrong/bigger-fish, on the iPhone 17 Pro Max simulator, scaled down. The loops, their
  posters, `kelp-forest-clearing.png` and `midnight-zone-lures.png` come from `scripts/bigger-fish-footage.sh`
  (`kelp-forest.7 opportunist 2 10` and `midnight-zone.3 collector 1 8`, the trailer's footage). `kelp-forest.png`
  and `midnight-zone.png` are the App Store captures (`scripts/bigger-fish-store-capture.sh kelp-shadows midnight-light`).
- `public/screenshots/sunset-cove.png` and `sunset-cove-hooks.png`: the same size, from the game's store capture
  (`scripts/bigger-fish-store-capture.sh sunset-hooks` in kraigstrong/bigger-fish, on the iPhone 17 Pro simulator).
- `public/screenshots/open-water.png`, `home-screen.png` and `pearl-shop.png`: 1.1's App Store captures
  (`scripts/bigger-fish-store-capture.sh open-water home shop`, moments added in kraigstrong/bigger-fish#256, on the
  iPhone 17 Pro Max simulator), scaled down.
- `public/media/worlds/jelly-bloom.mp4` and `sunset-cove.mp4`: cut from iPhone screen
  recordings of real play (2622 × 1206) to 1280 × 588 like the others, silent. The pause button is cropped off the
  right and the level's name blended out at the top left, so the boats along the top stay in frame. Each ends
  before the player is stung or eaten. Recut them from new recordings, or render them like the others.
- `public/press/`: the app icon, wordmarks (Avenir Next Heavy, the game's typeface), and key art.

Apple's rules for its badge and device imagery: use the official badge unmodified, at least 40pt tall, only once
the app is on the App Store; don't draw Apple devices or use the Apple logo.
