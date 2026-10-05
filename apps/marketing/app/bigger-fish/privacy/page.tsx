import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

// Bigger Fish is a native iOS app built outside this repo (kraigstrong/bigger-fish). Keep this in step
// with its PrivacyInfo.xcprivacy, its analytics payload (ArcadeAnalytics.swift, ArcadeMetrics.swift),
// the App Store privacy answers, and the analytics endpoint (src/lib/bigger-fish-analytics.ts).

const contactEmail = 'support@brightbench.app';

export const metadata: Metadata = {
  description: 'How Bigger Fish, an arcade game, handles information, including its anonymous gameplay summaries.',
  title: 'Bigger Fish Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Bigger Fish Sends',
    body: [
      'Bigger Fish has no accounts and never asks for a name, email address, photo, or location. It has no ads, no tracking, and no third-party code that collects data.',
      'To learn which levels are too hard or too easy, the game sends a short anonymous summary of each level played to BrightBench. It says which world, level, game mode, and version of that level it was; whether you had already cleared it; and how the run ended: cleared, quit, left unfinished, or lost, and if lost, whether to a bigger fish or a hazard such as jellyfish tentacles.',
      'The summary also includes how long the run lasted and how many laps of the level you swam; how many fish you and the other fish ate; how many of your catches were close in size; how many jellyfish bounces there were; the longest stretch between your meals; how long only fish you could eat were left; and how long the remaining fish were too big for you to grow into, when that first happened, and whether it changed back. At the end of the run it records your size, how many fish were left, how many of them you could eat, how big the largest was compared to you, and whether eating the rest could still have grown you enough. If a fish ate you, it records how much bigger that fish was.',
      'It also says how many tries it took to clear a level the first time, and whether you chose to play again, go to the next level, or leave after a win or loss.',
      'A few reports are sent only once per device, such as the first launch and the first time each level or world is started or cleared, so the totals can show how many players reach each level. Each report also says which version of the game sent it and whether it is a test build or the App Store version.',
    ],
  },
  {
    title: 'What Is Never Sent',
    body: [
      "No name, account, contact details, photo, or location. No device, advertising, session, or other identifier, and nothing that could tell one player's or device's reports apart from another's. No dates or times, device model, system version, or language. No touches or swimming paths.",
    ],
  },
  {
    title: 'How the Summaries Are Kept and Used',
    body: [
      'Each summary is checked and immediately added to running totals for each day, grouped by level and game version. Individual summaries are not stored, and the totals cannot be traced back to a player or a device. Daily totals are deleted after 90 days.',
      "The totals are used only to improve Bigger Fish's levels and difficulty. They are never used for advertising or tracking, and never sold or shared.",
      'Bigger Fish works without an internet connection. Summaries wait on the device until they can be sent, and a report that fails to send is discarded rather than retried.',
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
      'Bigger Fish saves which levels you have cleared, your best times, and whether you have seen the jellyfish lesson, so you can pick up where you left off. To send the once-per-device reports and try counts described above, it also keeps a few markers and counters on the device. None of these are sent to us; only the anonymous summaries are.',
      'Deleting the app removes this information. Like other app data, it may be included in your own device backups, which we cannot access.',
    ],
  },
  {
    title: 'Beta Testing',
    body: [
      'If you test Bigger Fish through TestFlight, Apple collects any feedback, screenshots, and crash reports you choose to send under its own privacy policy and shares them with us so we can fix problems.',
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
      'If how Bigger Fish handles information changes, we will update this page and its date before the change ships in the game.',
    ],
  },
];

export default function BiggerFishPrivacyPage() {
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
        <h1 style={{ fontSize: 44, margin: 0 }}>Bigger Fish Privacy Policy</h1>
        <p style={{ color: palette.inkMuted, margin: 0 }}>Last updated: October 5, 2026</p>

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
