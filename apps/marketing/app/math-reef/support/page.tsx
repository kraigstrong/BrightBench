import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { mathReefContactEmail as contactEmail } from '@/lib/math-reef';

// Keep answers in step with the app: star thresholds and unlocking in MathReef/Progress.swift,
// the Settings panel in MathReef/PracticeScene.swift.

export const metadata: Metadata = {
  description: 'Help with Math Reef, a math practice game for kids in grades 1 through 5.',
  title: 'Math Reef Support',
};

const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do you play?',
    answer:
      'Pick a world (Addition, Subtraction, Multiplication, Division, or Exponents), then a level. Touch and hold anywhere to swim up, and let go to sink. Swim into the fish carrying the right answer.',
  },
  {
    question: 'How do stars and new levels work?',
    answer:
      'Stars come from how many answers were right: 60% earns one star, 80% two, and 100% three. Two stars unlocks the next level. Checkpoint levels can be tried at any time, and passing one passes every level before it.',
  },
  {
    question: 'How do I turn the sound off?',
    answer:
      'Tap the gear on the reef map and switch Sound off. Sound plays even when the phone is on silent, so a child playing on a parent’s phone still hears it. The volume buttons always work.',
  },
  {
    question: 'Does it need the internet?',
    answer:
      'No. Math Reef works offline. When a connection is available, it sends anonymous usage counts, described in the privacy policy.',
  },
  {
    question: 'What’s free, and what does the unlock include?',
    answer:
      'The first three levels of each world are free (one in Exponents). A one-time purchase unlocks every level in all five worlds, and Family Sharing lets it cover everyone in your family. Grown-ups make the purchase after answering a question kids can’t easily solve.',
  },
  {
    question: 'How do I restore my purchase?',
    answer:
      'Tap the gear on the reef map, then For grown-ups, then Restore purchases. It works on any device signed in to the same Apple Account, or one in the same Family Sharing group.',
  },
  {
    question: 'How do I start over?',
    answer:
      'Progress is saved only on the device. To clear it, delete the app and install it again. Your purchase isn’t lost: restore it from Settings.',
  },
  {
    question: 'What does it run on?',
    answer: 'iPhone with iOS 17 or later. The game plays in landscape.',
  },
];

export default function MathReefSupportPage() {
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
        <h1 style={{ fontSize: 44, margin: 0 }}>Math Reef</h1>
        <p style={{ color: palette.inkMuted, fontSize: 18, lineHeight: 1.6, margin: 0 }}>
          Need help with Math Reef or have an idea? Email us and we will get back to you as soon as we can.
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
          Math Reef collects no personal information, only anonymous usage counts. See the{' '}
          <Link href="/math-reef/privacy">privacy policy</Link>.
        </p>
      </section>
    </main>
  );
}
