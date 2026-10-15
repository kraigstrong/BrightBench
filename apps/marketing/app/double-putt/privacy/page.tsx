import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

// Double Putt is a native iOS app built outside this repo (kraigstrong/double-putt). Keep this in step with its
// PrivacyInfo.xcprivacy, its analytics payload (MiniGolf/Game/Analytics.swift, docs/analytics.md), the App Store
// privacy answers, and the analytics endpoint (src/lib/double-putt-analytics.ts).

const contactEmail = 'support@brightbench.app';

export const metadata: Metadata = {
  description: 'How Double Putt, a mini golf puzzle game, handles information, including its anonymous gameplay counts.',
  title: 'Double Putt Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Double Putt Sends',
    body: [
      'Double Putt has no accounts or sign-in and never asks for a name, email address, photo, or location. It has no ads, no tracking, and no third-party code that collects data.',
      'To learn which pairs of holes are too hard or too easy, the game sends a short anonymous report of each attempt at a pair to BrightBench. It says which course and pair it was and which version of the course; whether it was played in a course round or in Single Hole; whether you had already finished that pair; and how the attempt ended: finished, restarted or left, or cut short by the app closing.',
      "The report also includes your strokes on each hole and the pair's par; how many swings you took, and how many of them in Mirror; how many balls went in the water; how many holes you made in one stroke, and whether that was a double ace; until you first finish a pair, which try at it this was; and how many seconds you spent on it.",
      'For course rounds, the game reports when a round is started, and whether it is your first round of that course; when a round is left unfinished, and on which pair; and when a round is finished, with its total strokes, the course par, the medal won, and whether it was your best round of that course.',
      'A few reports are sent only once per device: the first launch, the first time you finish each pair, the first double ace on each pair (its trophy), and each course a medal opens. Each report also says which version of the game sent it and whether it is a test build or the App Store version.',
    ],
  },
  {
    title: 'What Is Never Sent',
    body: [
      "No name, account, contact details, photo, or location. No device, advertising, session, or other identifier, and nothing that could tell one player's or device's reports apart from another's. No dates or times of day, device model, system version, or language. No touches, aim, or ball paths.",
    ],
  },
  {
    title: 'How the Reports Are Kept and Used',
    body: [
      'Each report is checked and immediately added to running totals for each day, grouped by pair or course and game version. Individual reports are not stored, and the totals cannot be traced back to a player or a device. Daily totals are deleted after 90 days.',
      "The totals are used only to improve Double Putt's pairs and courses and how hard they are. They are never used for advertising or tracking, and never sold or shared.",
      'Reports are sent soon after each pair or round ends and when you leave the app. Double Putt works without an internet connection; a report that fails to send is discarded rather than retried.',
    ],
  },
  {
    title: 'Service Providers',
    body: [
      'Reports are received by brightbench.app, which runs on Vercel, and the daily totals are stored with Upstash. Like any web service, Vercel handles each connection, including its IP address, to deliver the report. We do not store or log IP addresses or the reports themselves; Vercel and Upstash may keep their own operational logs under their policies.',
    ],
  },
  {
    title: 'Information Stored on Your Device',
    body: [
      'Double Putt keeps your progress on your device only: your best scores, medals, and trophies, which courses you have opened, a round in progress, which tips you have seen, and your sound setting. To send the once-per-device reports and try counts described above, it also keeps a few markers and counters, and holds reports until they are sent. None of these are sent to us; only the anonymous reports are.',
      "Double Putt doesn't use iCloud or any account, so deleting the app removes this information. Like other app data, it may be included in your own device backups, which we cannot access.",
    ],
  },
  {
    title: 'Beta Testing',
    body: [
      'If you test Double Putt through TestFlight, Apple collects any feedback, screenshots, and crash reports you choose to send under its own privacy policy and shares them with us so we can fix problems.',
    ],
  },
  {
    title: 'Contacting Us',
    body: [
      'If you email us, we receive what you choose to include and use it only to reply. We keep that correspondence only as long as needed to help you, and will delete it on request.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'If how Double Putt handles information changes, we will update this page and its date before the change ships in the game.',
    ],
  },
];

export default function DoublePuttPrivacyPage() {
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
        <h1 style={{ fontSize: 44, margin: 0 }}>Double Putt Privacy Policy</h1>
        <p style={{ color: palette.inkMuted, margin: 0 }}>Last updated: October 15, 2026</p>

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
