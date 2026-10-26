import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { supportConfig } from '@/lib/site';

export default function SupportPage() {
  return (
    <main
      style={{
        display: 'grid',
        gap: spacing.lg,
        margin: '0 auto',
        maxWidth: 760,
        paddingTop: spacing.xl,
      }}>
      <Link href="/" style={{ color: palette.inkMuted, fontWeight: 700 }}>
        Back to home
      </Link>

      <section
        style={{
          background: palette.surface,
          border: `1px solid ${palette.ring}`,
          borderRadius: radii.xl,
          display: 'grid',
          gap: spacing.md,
          padding: spacing.xxl,
        }}>
        <div
          style={{
            color: palette.inkMuted,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
          }}>
            Support
          </div>
        <h1 style={{ fontSize: 44, margin: 0 }}>{supportConfig.appName}</h1>
        <p
          style={{
            color: palette.inkMuted,
            fontSize: 18,
            lineHeight: 1.6,
            margin: 0,
          }}>
          {supportConfig.supportIntro}
        </p>
        <a
          href={`mailto:${supportConfig.supportEmail}`}
          style={{
            background: palette.coral,
            borderRadius: radii.pill,
            color: palette.white,
            display: 'inline-block',
            fontWeight: 700,
            padding: '14px 22px',
            width: 'fit-content',
          }}>
          {supportConfig.supportEmail}
        </a>
      </section>
    </main>
  );
}
