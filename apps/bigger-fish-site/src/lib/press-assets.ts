// The press kit's downloads, by their path under public/. The press page lists them and
// scripts/build-press-kit.ts packs them into one zip. Plain relative imports only: the build script runs in Node.

export type PressAsset = {
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
  detail: 'MP4, 1600 × 620, 0:25, with sound',
  file: 'media/bigger-fish-trailer.mp4',
  folder: 'Video',
  poster: '/media/trailer-poster.jpg',
  title: 'Trailer',
};

const loop = (slug: string, title: string, detail: string): PressAsset => ({
  detail,
  file: `media/worlds/${slug}.mp4`,
  folder: 'Video/Gameplay loops',
  poster: `/media/worlds/${slug}-poster.jpg`,
  title,
});

// Shallow Reef and Kelp Forest are rendered from the game; Jelly Bloom and Midnight Zone are cut from the trailer's
// gameplay, cropped clear of its captions and the game's buttons.
export const loops: PressAsset[] = [
  loop('shallow-reef', 'Shallow Reef', 'MP4, 1280 × 588, 0:05, silent, no interface'),
  loop('jelly-bloom', 'Jelly Bloom', 'MP4, 956 × 440, 0:04, silent, no interface'),
  loop('kelp-forest', 'Kelp Forest', 'MP4, 1280 × 588, 0:06, silent, no interface'),
  loop('midnight-zone', 'Midnight Zone', 'MP4, 956 × 440, 0:04, silent, no interface'),
];

const screenshot = (slug: string, title: string): PressAsset => ({
  detail: 'PNG, 2622 × 1206',
  file: `screenshots/${slug}.png`,
  folder: 'Screenshots',
  title,
});

export const screenshots: PressAsset[] = [
  screenshot('shallow-reef', 'Shallow Reef'),
  screenshot('jelly-bloom', 'Jelly Bloom'),
  screenshot('kelp-forest', 'Kelp Forest'),
  screenshot('midnight-zone', 'Midnight Zone'),
  screenshot('shallow-reef-big-fish', 'Shallow Reef, a bigger fish'),
  screenshot('jelly-bloom-school', 'Jelly Bloom, a school'),
  screenshot('kelp-forest-clearing', 'Kelp Forest, a clearing'),
  screenshot('midnight-zone-lures', 'Midnight Zone, lures'),
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
