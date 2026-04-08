import type { Metadata } from 'next';
import { palette, spacing } from '@education/design';

import './globals.css';
import { siteMeta } from '@/lib/site';

export const metadata: Metadata = {
  description: siteMeta.description,
  title: siteMeta.title,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          background:
            `radial-gradient(circle at top right, ${palette.backgroundAccent} 0%, transparent 28%), ` +
            `radial-gradient(circle at 12% 34%, rgba(46, 139, 139, 0.12) 0%, transparent 18%), ` +
            palette.background,
          color: palette.ink,
          fontFamily:
            '"Avenir Next", ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif',
          margin: 0,
        }}>
        <div
          style={{
            margin: '0 auto',
            maxWidth: 1120,
            minHeight: '100vh',
            padding: `${spacing.xl}px ${spacing.md}px ${spacing.xxl}px`,
          }}>
          {children}
        </div>
      </body>
    </html>
  );
}
