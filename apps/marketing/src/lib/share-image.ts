import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Helpers for the studio's share images (app/(studio)/**/opengraph-image.tsx). They're drawn once, at build time, so
// nothing here runs when someone visits.

export const shareImageSize = { height: 630, width: 1200 };

/** The studio's colors, as app/(studio)/studio.module.css has them. */
export const night = {
  coral: '#e97a5f',
  cream: '#f4f1ea',
  deep: '#071426',
  gold: '#f1bd63',
  ink: '#12355b',
  muted: '#b7c4d4',
  night: '#0b1d33',
  paper: '#fff9f2',
};

export type ShareFont = { data: ArrayBuffer; name: string; style: 'normal'; weight: 800 | 900 };

/**
 * Nunito, the site's typeface, cut down to the letters an image uses. Google Fonts serves TrueType to a client that
 * isn't a browser, which is what the image renderer reads. Without it (no network at build time) the image falls back
 * to Next's own font rather than failing the build, as next/font does for the pages.
 */
export async function nunito(weight: 800 | 900, text: string): Promise<ShareFont[]> {
  try {
    const query = `family=Nunito:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`, { cache: 'force-cache' })).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) throw new Error('no TrueType source in the stylesheet');
    const font = await fetch(url, { cache: 'force-cache' });
    if (!font.ok) throw new Error(`font request answered ${font.status}`);
    return [{ data: await font.arrayBuffer(), name: 'Nunito', style: 'normal', weight }];
  } catch (error) {
    console.warn(`Share image: Nunito ${weight} unavailable, using the default font.`, error);
    return [];
  }
}

const mimeTypes: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png' };

/** A picture from public/, inlined for the image renderer. `path` is as the pages use it: "/games/…". */
export async function publicImage(path: string): Promise<string> {
  const data = await readFile(join(process.cwd(), 'public', path));
  const type = mimeTypes[path.split('.').pop() ?? ''] ?? 'application/octet-stream';
  return `data:${type};base64,${data.toString('base64')}`;
}
