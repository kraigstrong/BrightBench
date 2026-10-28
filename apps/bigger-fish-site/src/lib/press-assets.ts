// The press kit's downloads, by their path under public/. The press page lists them and
// scripts/build-press-kit.ts packs them into one zip. Plain relative imports only: the build script runs in Node.

import { worlds } from './game.ts';

export type PressAsset = {
  /** What an image shows, for screen readers. */
  alt?: string;
  /** Path under public/. */
  file: string;
  title: string;
  /** Format and size, e.g. "PNG, 2622 × 1206". */
  detail: string;
  /** Folder inside the zip. */
  folder: string;
  /** Shown on a light tile (dark artwork). */
  light?: boolean;
  /** A still to show for a video. */
  poster?: string;
};

export const pressKitZip = 'press/bigger-fish-press-kit.zip';

export const trailer: PressAsset = {
  detail: 'MP4, 1920 × 886, 0:30, with sound',
  file: 'media/bigger-fish-trailer.mp4',
  folder: 'Video',
  poster: '/media/trailer-poster.jpg',
  title: 'Trailer',
};

const loop = (slug: string, title: string, detail: string, folder = 'worlds'): PressAsset => ({
  detail,
  file: `media/${folder}/${slug}.mp4`,
  folder: 'Video/Gameplay loops',
  poster: `/media/${folder}/${slug}-poster.jpg`,
  title,
});

// Shallow Reef, Kelp Forest and Midnight Zone are rendered from the game. Jelly Bloom and Sunset Cove are cut from
// screen recordings of real play on an iPhone, cropped clear of the pause button with the level's name blended out.
// The Open Water's is rendered from the game, cropped clear of its fish and pearl counts; the pearl shop's is a
// recording of its screen. The home page shows the last two beside the Open Water.
export const loops: PressAsset[] = [
  loop('shallow-reef', 'Shallow Reef', 'MP4, 1280 × 588, 0:05, silent, no interface'),
  loop('jelly-bloom', 'Jelly Bloom', 'MP4, 1280 × 588, 0:03, silent, no interface'),
  loop('kelp-forest', 'Kelp Forest', 'MP4, 1280 × 588, 0:06, silent, no interface'),
  loop('sunset-cove', 'Sunset Cove', 'MP4, 1280 × 588, 0:04, silent, no interface'),
  loop('midnight-zone', 'Midnight Zone', 'MP4, 1280 × 588, 0:05, silent, no interface'),
  loop('open-water', 'Open Water', 'MP4, 1280 × 588, 0:05, silent, no interface', 'modes'),
  loop('pearl-shop', 'Pearl shop', 'MP4, 1280 × 588, 0:05, silent, the shop screen', 'modes'),
];

// A world's own screenshot is described as in game.ts; the others say what they show.
const screenshot = (slug: string, title: string, alt?: string): PressAsset => ({
  alt: alt ?? worlds.find((world) => world.screenshot === `/screenshots/${slug}.png`)?.screenshotAlt,
  detail: 'PNG, 2622 × 1206',
  file: `screenshots/${slug}.png`,
  folder: 'Screenshots',
  title,
});

export const screenshots: PressAsset[] = [
  screenshot('shallow-reef', 'Shallow Reef'),
  screenshot('jelly-bloom', 'Jelly Bloom'),
  screenshot('kelp-forest', 'Kelp Forest'),
  screenshot('sunset-cove', 'Sunset Cove'),
  screenshot('midnight-zone', 'Midnight Zone'),
  screenshot(
    'shallow-reef-big-fish',
    'Shallow Reef, a bigger fish',
    "Shallow Reef: the player's small orange fish near the top, a big pink striped fish ahead.",
  ),
  screenshot(
    'jelly-bloom-school',
    'Jelly Bloom, a school',
    'Jelly Bloom: a school of fish in purple water between two jellyfish.',
  ),
  screenshot(
    'kelp-forest-clearing',
    'Kelp Forest, a clearing',
    "Kelp Forest: the player's fish eating at the edge of the kelp, a big fish fading out of it, open water beyond.",
  ),
  screenshot(
    'sunset-cove-hooks',
    'Sunset Cove, a baited hook',
    "Sunset Cove: a baited hook hanging from a boat's line into pink evening water, fish all around.",
  ),
  screenshot(
    'midnight-zone-lures',
    'Midnight Zone, lures',
    "Midnight Zone: the beam from the player's lure lighting up anglerfish and their glowing lures in the dark.",
  ),
  screenshot(
    'open-water',
    'Open Water',
    "Open Water: an endless run passing through Sunset Cove, pearls glowing among the fish under the boats' hooks.",
  ),
  screenshot(
    'home-screen',
    'Home screen',
    "Home screen: Adventure and Open Water, the two ways to play, beside the player's fish in a cotton candy coat and a flower, the Shop below it.",
  ),
  screenshot(
    'pearl-shop',
    'Pearl shop',
    "Pearl shop: colors for the player's fish, priced in pearls, and the fish wearing gold with a party hat and a confetti trail.",
  ),
];

export const brand: PressAsset[] = [
  { detail: 'PNG, 1024 × 1024', file: 'press/bigger-fish-icon-1024.png', folder: 'Logo and icon', title: 'App icon' },
  {
    detail: 'PNG, 1024 × 1024, rounded, transparent',
    file: 'press/bigger-fish-icon-rounded-1024.png',
    folder: 'Logo and icon',
    title: 'App icon, rounded',
  },
  {
    detail: 'PNG, transparent, for dark backgrounds',
    file: 'press/bigger-fish-wordmark-white.png',
    folder: 'Logo and icon',
    title: 'Wordmark, white',
  },
  {
    detail: 'PNG, transparent, for light backgrounds',
    file: 'press/bigger-fish-wordmark-navy.png',
    folder: 'Logo and icon',
    light: true,
    title: 'Wordmark, navy',
  },
  { detail: 'PNG, 2400 × 1260', file: 'press/bigger-fish-key-art.png', folder: 'Logo and icon', title: 'Key art' },
];

/** Everything in the zip, in order. */
export const pressKitFiles: PressAsset[] = [trailer, ...loops, ...screenshots, ...brand];

/** A file's name inside the zip. */
export function zipPath(asset: PressAsset): string {
  return `Bigger Fish press kit/${asset.folder}/${asset.file.split('/').pop()}`;
}
