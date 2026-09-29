import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { siteMeta } from '@/lib/site';

// Math Reef is a native iOS app built outside this repo; this is its App Store privacy policy URL.
// Keep it in step with the app's PrivacyInfo.xcprivacy and App Store privacy answers.

export const metadata: Metadata = {
  description: 'How Math Reef, a math practice game for kids, handles information.',
  title: 'Math Reef Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'Information We Collect',
    body: [
      'Math Reef does not collect any information. There are no accounts, and the app does not ask for a name, email address, photo, or location.',
      'The app makes no network connections. It has no ads, no analytics, no tracking, and no third-party code that collects data.',
    ],
  },
  {
    title: 'Information Stored on Your Device',
    body: [
      'Math Reef saves progress (stars, passed levels, and crowns) and sound settings on the device so a child can pick up where they left off. This stays on the device and is never sent to us.',
      'Deleting the app removes this information. Like other app data, it may be included in your own device backups, which we cannot access.',
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      'Math Reef is made for children in grades 1 through 5. We do not collect personal information from children or anyone else through the app.',
      'If you believe a child has sent us personal information, for example by email, contact us and we will delete it.',
    ],
  },
  {
    title: 'Contacting Us',
    body: [
      'If you email us, we receive what you choose to include and use it only to reply. We keep that correspondence only as long as needed to help you.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'If how Math Reef handles information changes, we will update this page and its date before the change ships in the app.',
    ],
  },
];

export default function MathReefPrivacyPage() {
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
        <h1 style={{ fontSize: 44, margin: 0 }}>Math Reef Privacy Policy</h1>
        <p style={{ color: palette.inkMuted, margin: 0 }}>Last updated: September 29, 2026</p>

        {sections.map((section) => (
          <div key={section.title} style={{ display: 'grid', gap: spacing.sm }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                style={{ color: palette.inkMuted, fontSize: 18, lineHeight: 1.6, margin: 0 }}>
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        <p style={{ color: palette.inkMuted, margin: 0 }}>
          Questions can be sent to{' '}
          <a href={`mailto:${siteMeta.supportEmail}`}>{siteMeta.supportEmail}</a>.
        </p>
      </section>
    </main>
  );
}
