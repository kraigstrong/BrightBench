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
          background: palette.background,
          color: palette.ink,
          fontFamily:
            '"Avenir Next", "Avenir Next Rounded", ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif',
          margin: 0,
        }}>
        <div
          style={{
            margin: '0 auto',
            maxWidth: 1180,
            minHeight: '100vh',
            padding: `${spacing.xl}px 20px ${spacing.xxl * 2}px`,
          }}>
          {children}
        </div>
      </body>
    </html>
  );
}
