import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import { spacing } from '@education/design';

import { base, game } from '@/lib/double-putt-site';

import styles from './layout.module.css';

// Apple devices show SF Rounded, the game's own typeface; everyone else gets Nunito, its closest rounded cousin.
const nunito = Nunito({ display: 'swap', subsets: ['latin'], variable: '--font-nunito', weight: ['600', '800', '900'] });

const title = `${game.name}: ${game.tagline}`;
const image = { alt: `${game.name}: ${game.tagline}`, height: 630, url: `${base}/og.png`, width: 1200 };

export const metadata: Metadata = {
  description: game.oneLiner,
  icons: { apple: `${base}/icon-1024.png`, icon: `${base}/icon-1024.png` },
  openGraph: { description: game.oneLiner, images: [image], siteName: game.name, title, type: 'website' },
  title: { default: title, template: `%s · ${game.name}` },
  twitter: { card: 'summary_large_image', description: game.oneLiner, images: [image], title },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#10231a',
};

/**
 * Double Putt's own site, inside brightbench.app. The root layout centres every page in a padded column; these pages
 * fill the window instead, as the game does, so the shell steps back out of that padding (the root's own spacing).
 */
export default function DoublePuttLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const frame = { '--frame-bottom': `${spacing.xxl * 2}px`, '--frame-top': `${spacing.xl}px` } as React.CSSProperties;
  return (
    <div className={`${styles.shell} ${nunito.variable}`} style={frame}>
      {children}
    </div>
  );
}
