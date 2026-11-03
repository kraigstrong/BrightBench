import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { ghostThread } from '@/lib/ghost-thread';

// Keep this in step with the app's PrivacyInfo.xcprivacy and what it sends (Apex/ApexOnline.swift, kraigstrong/
// apex-rivals), the App Store privacy answers, and what the lap service keeps (src/lib/apex-laps.ts, apex-redis.ts).

const contactEmail = ghostThread.contactEmail;

export const metadata: Metadata = {
  alternates: { canonical: '/ghost-thread/privacy' },
  description:
    'How Ghost Thread, a racing game, handles information: anonymous lap counts, and best laps shared under your Game Center nickname.',
  title: 'Ghost Thread Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Ghost Thread Sends',
    body: [
      'Ghost Thread has no accounts of its own and never asks for your name, email address, photo, or location. It has no ads, no tracking, and no third-party code that collects data.',
      'Every lap you finish on a circuit is sent to BrightBench without anything that says who drove it, so we can see how often each circuit is raced and how hard it is: the circuit and its version, the lap time, the times at the end of the first two sectors, and how many times the car hit a wall. Each batch of laps also says which version of the game sent it and whether it is a test build or the App Store version. Laps in Apex School, the tutorial, are not sent.',
      'When a session ends, the game asks where its best lap falls among other players’ best laps on that circuit, and to find you a rival it asks for another player’s lap a little faster than yours. These requests carry the lap time and, if you are signed in to Game Center, a scrambled form of your Game Center player ID (a one-way hash), so that your own lap is left out. Nothing about them is stored.',
      'The game adds nothing about your device to any of this. Like any app’s web requests, its requests carry the standard headers iOS adds, which name the game’s version, the iOS version, and your preferred languages; the lap service does not read or keep them.',
    ],
  },
  {
    title: 'Game Center, Best Laps, and Ghosts',
    body: [
      'Signing in to Game Center is up to you. Without it the game still plays, races other players’ ghosts, and keeps your laps on the device; leaderboards, achievements, sharing your own ghost, and racing friends need it. Game Center is run by Apple, which keeps your leaderboard times and achievements under its own privacy policy.',
      'While you are signed in, the game sends your best lap on each circuit to BrightBench so other players can race it: your Game Center player ID, your public Game Center nickname, the lap and sector times, and the lap’s ghost, the path your car took around the circuit. A best set on the device while no one was signed in goes up the next time someone signs in there. Game Center’s own signature comes with each one, so no one else can send a lap in your name.',
      'We keep your best lap and its ghost on each circuit with your nickname and a salted, scrambled form of your player ID, never the ID itself. Your nickname, best time, sector times, and ghost on each circuit are public: the game hands them to other players as a rival, and your Game Center friends see your time in Race a friend and can race your ghost.',
      'If you let Ghost Thread see your Game Center friends, it sends scrambled forms of their player IDs to find which of them have a best lap on a circuit, and fetches the lap of the friend you pick to race. Nothing about these requests is stored, and your friends’ names never leave your device.',
    ],
  },
  {
    title: 'The Unlock',
    body: [
      `Ghost Thread is free to try: ${ghostThread.freeCircuit} and Apex School are free. A one-time purchase, ${ghostThread.unlock.name}, opens every other circuit and every circuit added later, and Family Sharing lets it cover your family.`,
      'Purchases are handled entirely by Apple. We never see payment details or who made a purchase, and the game does not report whether you have bought it.',
    ],
  },
  {
    title: 'What Is Never Sent',
    body: [
      'No name, email address, contact details, photo, or location. No payment details, receipts, or Apple Account information. No device, advertising, or other identifier beyond the Game Center player ID described above.',
    ],
  },
  {
    title: 'How It Is Kept and Used',
    body: [
      'Laps are kept only as daily totals for each circuit: how many laps were driven, how their times were spread, and how often cars hit the walls. Individual laps, their sector times, and the version that sent them are not stored, and the totals are deleted after 90 days.',
      'Best laps and their ghosts make up the online boards, so they are kept with no time limit; a faster lap of yours replaces yours. Times on Game Center’s own leaderboards are kept by Apple.',
      'All of it is used only to run and improve Ghost Thread. It is never used for advertising or tracking, and never sold or shared.',
      'Ghost Thread plays without an internet connection. Laps that cannot be sent wait on the device, up to 500, and are sent the next time you open the game or finish a lap with a connection.',
    ],
  },
  {
    title: 'Service Providers',
    body: [
      'Requests are received by brightbench.app, which runs on Vercel, and laps, best laps, and ghosts are stored with Upstash. Like any web service, Vercel handles each connection, including its IP address, to deliver the request, keeps it briefly in its request logs, and limits how many requests a minute each address can make, to stop abuse. We do not store IP addresses ourselves.',
    ],
  },
  {
    title: 'Information Stored on Your Device',
    body: [
      'Ghost Thread saves your best lap and its ghost on each circuit, your car colors, sound settings, Apex School progress, the friend you are racing on each circuit, and whether you have the unlock, so you can pick up where you left off. Laps waiting to be sent are kept there too.',
      'Deleting the app removes this information. Like other app data, it may be included in your own device backups, which we cannot access.',
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      'Ghost Thread is a game for everyone and is not directed at children under 13. We do not knowingly collect personal information from children. Game Center nicknames are public; Game Center’s settings, and Screen Time, let a parent control what a child shares there.',
      'If you believe a child has sent us personal information, contact us and we will delete it.',
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
      'If how Ghost Thread handles information changes, we will update this page and its date before the change ships in the app.',
    ],
  },
];

export default function GhostThreadPrivacyPage() {
  return (
    <main
      style={{
        display: 'grid',
        gap: spacing.lg,
        margin: '0 auto',
        maxWidth: 760,
        paddingTop: spacing.xl,
      }}>
      <Link href="/ghost-thread" style={{ color: palette.inkMuted, fontWeight: 700 }}>
        Back to Ghost Thread
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
        <h1 style={{ fontSize: 44, margin: 0 }}>Ghost Thread Privacy Policy</h1>
        <p style={{ color: palette.inkMuted, margin: 0 }}>Last updated: November 2, 2026</p>

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
