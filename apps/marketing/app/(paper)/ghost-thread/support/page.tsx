import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { circuits, ghostThread } from '@/lib/ghost-thread';

// Keep answers in step with the app (kraigstrong/apex-rivals): the track list (Apex/TrackMenu.swift), the race's gear
// menu (RaceMenu in Apex/ContentView.swift), Race a friend (Apex/Friends.swift), and the unlock (Apex/UnlockView.swift).

const contactEmail = ghostThread.contactEmail;
const { freeCircuit, unlock } = ghostThread;

export const metadata: Metadata = {
  alternates: { canonical: '/ghost-thread/support' },
  description: 'Help with Ghost Thread, a one-touch racing game for iPhone and iPad.',
  title: 'Ghost Thread Support',
};

const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do you play?',
    answer:
      'Pick a circuit from the track list and touch to start. Hold anywhere to steer up, and let go to steer down. The camera turns with the track, so the road ahead always runs left to right. Set the fastest lap you can: a good one is about 30 seconds.',
  },
  {
    question: 'Why am I slow?',
    answer:
      'Speed comes from how straight you drive. Every weave costs speed, and so does hugging the inside of a corner. Swing wide, clip the apex, and run out wide. In a race, the gear menu’s Show ideal line draws the fastest line on the track.',
  },
  {
    question: 'Is there a tutorial?',
    answer:
      'Apex School, top left of the track list, is a short lesson in the racing line: the line painted on, with a cue for when to turn in, where the apex is, and when to ease back out. Hit two apexes and you’re ready for the circuits.',
  },
  {
    question: 'What are the ghosts?',
    answer:
      'The blue ghost is your best lap on the circuit. The gold ghost is your rival: another player’s best lap a little faster than yours, or a bot driving the ideal line when there isn’t one. Beat it and a new one takes its place.',
  },
  {
    question: 'How do I race a friend?',
    answer:
      'Sign in to Game Center, and allow Ghost Thread to see your friends when the track list asks. Then, in a race, open the gear menu and choose Race a friend: it lists your Game Center friends with a time on that circuit. A friend shows up once they’ve allowed it too.',
  },
  {
    question: 'How do medals work?',
    answer:
      'Each circuit has bronze, silver, gold, and platinum medals for beating set lap times. The track list shows your best medal on each circuit and the next one to chase. Each medal is also a Game Center achievement.',
  },
  {
    question: 'Is it free?',
    answer: `${freeCircuit} and Apex School are free. One purchase, ${unlock.name} for ${unlock.price}, opens the other ${circuits.length - 1} circuits, and every circuit added later. It works with Family Sharing, so everyone in your family group can race them.`,
  },
  {
    question: 'How do I restore my purchase?',
    answer: `Tap any locked circuit on the track list, then Restore purchase. It brings ${unlock.name} back on a new device or after reinstalling, with the same Apple Account you bought it with.`,
  },
  {
    question: 'How do I change my car’s colors?',
    answer:
      'Tap COLORS on the track list, or choose Car colors from the gear menu in a race. Your car, your best-lap ghost, and your rival each have their own color.',
  },
  {
    question: 'How do I turn the sound off?',
    answer: 'In a race, open the gear menu: Sound and Music each turn on and off there.',
  },
  {
    question: 'How do I start a circuit over?',
    answer:
      'In a race on that circuit, open the gear menu and choose Clear best lap. It clears your best lap and its ghost on this device; your best on the online boards stays until a faster lap of yours replaces it.',
  },
  {
    question: 'Does it need an internet connection?',
    answer:
      'No. Offline, your rival is a bot and your laps wait on the device to send later. Other players’ ghosts, the standings at the end of a session, and Game Center need a connection.',
  },
  {
    question: 'What does it run on?',
    answer: `${ghostThread.requirements[0].toUpperCase()}${ghostThread.requirements.slice(1)}. It plays in landscape.`,
  },
];

export default function GhostThreadSupportPage() {
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
          Support
        </div>
        <h1 style={{ fontSize: 44, margin: 0 }}>Ghost Thread</h1>
        <p style={{ color: palette.inkMuted, fontSize: 18, lineHeight: 1.6, margin: 0 }}>
          Need help with Ghost Thread or have an idea? Email us and we will get back to you as soon as we can.
        </p>
        <a
          href={`mailto:${contactEmail}`}
          style={{
            background: palette.coral,
            borderRadius: radii.pill,
            color: palette.white,
            display: 'inline-block',
            fontWeight: 700,
            padding: '14px 22px',
            width: 'fit-content',
          }}>
          {contactEmail}
        </a>

        {faqs.map((faq) => (
          <div key={faq.question} style={{ display: 'grid', gap: spacing.sm }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>{faq.question}</h2>
            <p style={{ color: palette.inkMuted, fontSize: 18, lineHeight: 1.6, margin: 0 }}>
              {faq.answer}
            </p>
          </div>
        ))}

        <p style={{ color: palette.inkMuted, margin: 0 }}>
          Ghost Thread sends anonymous laps, kept only as daily counts, and, if you’re signed in to Game Center, shares
          your best lap on each circuit under your nickname. See the{' '}
          <Link href="/ghost-thread/privacy">privacy policy</Link>.
        </p>
      </section>
    </main>
  );
}
