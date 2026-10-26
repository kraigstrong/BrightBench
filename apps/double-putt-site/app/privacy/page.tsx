import type { Metadata } from 'next';

import { ProsePage, ProseSection } from '@/components/prose-page';
import { contactEmail } from '@/lib/site';

// Double Putt is a native iOS app built outside this repo (kraigstrong/double-putt). Keep this in step with its
// PrivacyInfo.xcprivacy, its analytics payload (MiniGolf/Game/Analytics.swift, docs/analytics.md), the App Store
// privacy answers, and the analytics endpoint, which stays on brightbench.app (apps/marketing/src/lib/
// double-putt-analytics.ts). The App Store listing and the game's Settings link here, some of them by way of the old
// brightbench.app/doubleputt/privacy, which redirects.

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  description: 'How Double Putt, a mini golf puzzle game, handles information, including its anonymous gameplay counts.',
  title: 'Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Double Putt Sends',
    body: [
      'Double Putt has no accounts or sign-in and never asks for a name, email address, photo, or location. It has no ads, no tracking, and no third-party code that collects data.',
      'To learn which holes are too hard or too easy, the game sends a short anonymous report of each attempt at a hole to BrightBench. It says which course and hole it was and which version of the course; whether it was played in a course round or in Free Play; whether you had already finished that hole; and how the attempt ended: finished, restarted or left, or cut short by the app closing.',
      "The report also includes your strokes on each of the hole's two greens and its par; how many swings you took, and how many of them in Mirror; how many balls went in the water; how many greens you made in one stroke, and whether that was a double ace; until you first finish a hole, which try at it this was; and how many seconds you spent on it.",
      'For course rounds, the game reports when a round is started, and whether it is your first round of that course; when a round is left unfinished, and on which hole; and when a round is finished, with its total strokes, the course par, the medal won, and whether it was your best round of that course.',
      'A few reports are sent only once each time the game is installed: the first launch, each course a medal opens, and, for each version of the courses, the first time you finish each hole and the first double ace on it (its trophy). Each report also says which version of the game sent it and whether it is a test build or the App Store version.',
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
      'Each report is checked and immediately added to running totals for each day, grouped by hole or course and game version. Individual reports are not stored, and the totals cannot be traced back to a player or a device. Daily totals are deleted after 90 days.',
      "The totals are used only to improve Double Putt's holes and courses and how hard they are. They are never used for advertising or tracking, and never sold or shared.",
      'Reports wait on the device and are sent together in small batches: when enough have collected, when you leave the app, and when it next opens. Double Putt works without an internet connection; a batch that fails to send is discarded rather than retried.',
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
      'Double Putt keeps your progress on your device only: your best scores, medals, and trophies, which courses you have opened, a round in progress, which tips you have seen, and your sound setting. To send the once-per-installation reports and try counts described above, it also keeps a few markers and counters, and holds reports until they are sent. None of these are sent to us; only the anonymous reports are.',
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
    <ProsePage eyebrow="Privacy" intro={<p>Last updated: October 24, 2026</p>} title="Double Putt Privacy Policy">
      {sections.map((section) => (
        <ProseSection key={section.title} title={section.title}>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ProseSection>
      ))}
      <ProseSection title="Questions">
        <p>
          Questions can be sent to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
