import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';

import { game } from '@/lib/game';
import { appStoreId, siteOrigin } from '@/lib/site';

import './globals.css';

// Apple devices show Avenir Next, the game's own typeface; everyone else gets Nunito, its closest rounded cousin.
const nunito = Nunito({ display: 'swap', subsets: ['latin'], variable: '--font-nunito', weight: ['600', '800', '900'] });

const title = `${game.name}: ${game.tagline}`;
const appId = appStoreId();

export const metadata: Metadata = {
  description: game.oneLiner,
  ...(appId ? { itunes: { appId } } : {}),
  metadataBase: new URL(siteOrigin()),
  openGraph: {
    description: game.oneLiner,
    siteName: game.name,
    title,
    type: 'website',
  },
  title: { default: title, template: `%s · ${game.name}` },
  twitter: { card: 'summary_large_image', description: game.oneLiner, title },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#071530',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={nunito.variable} lang="en">
      <body>{children}</body>
    </html>
  );
}
