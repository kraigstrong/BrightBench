import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';

import { game, siteOrigin } from '@/lib/site';

import './globals.css';

// Apple devices show SF Rounded, the game's own typeface; everyone else gets Nunito, its closest rounded cousin.
const nunito = Nunito({ display: 'swap', subsets: ['latin'], variable: '--font-nunito', weight: ['600', '800', '900'] });

const title = `${game.name}: ${game.tagline}`;
const image = { alt: `${game.name}: ${game.tagline}`, height: 630, url: '/og.png', width: 1200 };

export const metadata: Metadata = {
  description: game.oneLiner,
  icons: { apple: '/icon-1024.png', icon: '/icon-1024.png' },
  metadataBase: new URL(siteOrigin()),
  openGraph: { description: game.oneLiner, images: [image], siteName: game.name, title, type: 'website' },
  title: { default: title, template: `%s · ${game.name}` },
  twitter: { card: 'summary_large_image', description: game.oneLiner, images: [image], title },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#10231a',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={nunito.variable} lang="en">
      <body>{children}</body>
    </html>
  );
}
