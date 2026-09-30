import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { mathReefContactEmail as contactEmail } from '@/lib/math-reef';

// Keep this in step with the app's PrivacyInfo.xcprivacy, its analytics payload (ReefAnalytics.swift),
// the App Store privacy answers, and the analytics endpoint (src/lib/math-reef-analytics.ts).

export const metadata: Metadata = {
  description: 'How Math Reef, a math practice game for kids, handles information, including its anonymous usage counts.',
  title: 'Math Reef Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Math Reef Sends',
    body: [
      'Math Reef has no accounts and never asks for a name, email address, photo, or location. It has no ads, no tracking, and no third-party code that collects data.',
      'To learn which levels are too hard or too easy and where kids stop playing, the app sends anonymous usage counts to BrightBench: which levels are started and passed, which crowns are earned, and how each round ends (finished, quit, or left partway), with how many questions were answered correctly and the stars earned. It also sends whether the unlock screen was shown and whether the full game was unlocked. Each report also says which version of the app sent it and whether it is a test build or the App Store version.',
      'A few of these are sent only once per device, such as the first time a level is started, so the totals can show how many players reach each level.',
    ],
  },
  {
    title: 'The Unlock',
    body: [
      'Math Reef is free to try: the first three levels of each world (one in Exponents) are free. A one-time purchase unlocks every level, and Family Sharing lets it cover the whole family.',
      'The purchase screen is behind the same grown-ups-only question as our links. Purchases are handled entirely by Apple; we never see payment details or who made a purchase.',
    ],
  },
  {
    title: 'What Is Never Sent',
    body: [
      'No name, account, contact details, photo, or location. No device, advertising, or other identifier, and nothing that could tell one child\'s or device\'s reports apart from another\'s. No dates or times, device model, system version, or language. Nothing about which answers were chosen or how long anything took.',
    ],
  },
  {
    title: 'How the Counts Are Kept and Used',
    body: [
      'We keep only running totals for each day, such as how many rounds of a level were finished. Individual reports are not stored, and the totals cannot be traced back to a child, a family, or a device.',
      'The counts are used only to improve Math Reef. They are never used for advertising or tracking, and never sold or shared.',
      'Math Reef works without an internet connection. A report that cannot be sent is simply discarded.',
    ],
  },
  {
    title: 'Service Providers',
    body: [
      'Reports are received by brightbench.app, which runs on Vercel, and the daily totals are stored with Upstash. Like any web service, Vercel handles each connection, including its IP address, to deliver the report. We do not store or log IP addresses.',
    ],
  },
  {
    title: 'Information Stored on Your Device',
    body: [
      'Math Reef saves a progress record (each level\'s best score and stars, which levels are passed, and crowns) and sound settings on the device so a child can pick up where they left off. That record stays on the device and is never sent to us; only the anonymous counts described above are.',
      'Deleting the app removes this information. Like other app data, it may be included in your own device backups, which we cannot access.',
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      'Math Reef is made for children in grades 1 through 5. We do not collect personal information from children or anyone else through the app; the anonymous counts described above contain none.',
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
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>
    </main>
  );
}
