import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { privacyConfig } from '@/lib/site';

export default function PrivacyPage() {
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
          Privacy
        </div>
        <h1 style={{ fontSize: 44, margin: 0 }}>
          Privacy at {privacyConfig.appName}
        </h1>
        <p
          style={{
            color: palette.inkMuted,
            fontSize: 18,
            lineHeight: 1.6,
            margin: 0,
          }}>
          We want these products to collect as little personal information as
          possible. This page is the shared starting point for app-specific
          privacy pages.
        </p>
        <ul
          style={{
            color: palette.inkMuted,
            display: 'grid',
            gap: spacing.sm,
            lineHeight: 1.6,
            margin: 0,
            paddingLeft: 22,
          }}>
          {privacyConfig.dataPracticesSummary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p
          style={{
            color: palette.inkMuted,
            margin: 0,
          }}>
          Questions can be sent to{' '}
          <a href={`mailto:${privacyConfig.contactEmail}`}>{privacyConfig.contactEmail}</a>.
        </p>
      </section>
    </main>
  );
}
