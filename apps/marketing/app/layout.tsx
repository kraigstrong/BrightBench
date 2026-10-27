import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { palette } from '@education/design';

import './globals.css';
import { getPublicSiteOrigin, siteMeta } from '@/lib/site';
import { studio } from '@/lib/studio';

// Apple devices show Avenir Next, the apps' own typeface; everyone else gets Nunito, its closest rounded cousin.
const nunito = Nunito({ display: 'swap', subsets: ['latin'], variable: '--font-nunito', weight: ['600', '800', '900'] });

export const metadata: Metadata = {
  description: siteMeta.description,
  metadataBase: new URL(getPublicSiteOrigin()),
  openGraph: {
    description: siteMeta.description,
    siteName: siteMeta.title,
    title: studio.title,
    type: 'website',
  },
  title: studio.title,
  twitter: {
    card: 'summary_large_image',
    description: siteMeta.description,
    title: studio.title,
  },
};

// The page's colors live on <html> as variables, so globals.css can paint the canvas (what shows past the page's
// edges when it bounces) and switch it for the studio's dark pages.
const rootColors = {
  '--ink': palette.ink,
  '--paper': palette.background,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={nunito.variable} lang="en" style={rootColors}>
      <body>{children}</body>
    </html>
  );
}
