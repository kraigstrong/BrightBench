import { spacing } from '@education/design';

// The warm paper look of the learning side (Learn, the product pages and guides) and the plain pages: support,
// privacy, stats. Its colors are the page's own (app/globals.css); the studio's dark pages are in app/(studio).
export default function PaperLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: 1180,
        minHeight: '100vh',
        padding: `${spacing.xl}px 20px ${spacing.xxl * 2}px`,
      }}>
      {children}
    </div>
  );
}
