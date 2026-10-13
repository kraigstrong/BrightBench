import type { Metadata } from 'next';
import Link from 'next/link';

import { ProsePage, ProseSection } from '@/components/prose-page';
import { game } from '@/lib/game';
import { contactEmail } from '@/lib/site';

import styles from './support.module.css';

// Keep answers in step with the game (kraigstrong/bigger-fish): unlocking in ArcadeProgress.swift, the pause
// menu's sound toggles in GameScene.swift, the iOS deployment target.

export const metadata: Metadata = {
  alternates: { canonical: '/support' },
  description: `Help with ${game.name}, a one-touch arcade game for iPhone and iPad.`,
  title: 'Support',
};

const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do you play?',
    answer:
      'Touch and hold anywhere to swim up, and let go to sink. Swim into fish smaller than you to eat them and grow, and keep away from anything bigger.',
  },
  {
    question: 'Why do the other fish get bigger?',
    answer: "They're eating too. Grow faster than they do: eat what you can, while you can.",
  },
  {
    question: 'What does it cost?',
    answer:
      'The first world is free, and so are the first two levels of every other world. One $4.99 purchase unlocks the rest, including every Deep End.',
  },
  {
    question: 'How do new worlds open?',
    answer:
      "Every world is open from the start, so you can try each one. Beat a world's tenth level to open its Deep End: five harder levels, each opening when you clear the one before.",
  },
  {
    question: 'How do I turn off the music or sound effects?',
    answer: 'Pause during a level and switch Music or Effects off. The setting is remembered.',
  },
  {
    question: 'Does it need the internet?',
    answer:
      'No. Bigger Fish plays offline. When a connection is available, it sends anonymous gameplay summaries, described in the privacy policy.',
  },
  {
    question: 'Is my progress saved?',
    answer:
      'Yes. Progress is saved on your device and backed up to your iCloud account, so it carries over to your other iPhone or iPad, and to a new one.',
  },
  {
    question: 'What does it run on?',
    answer: game.requirements,
  },
];

export default function SupportPage() {
  const email = contactEmail();
  return (
    <ProsePage
      eyebrow="Support"
      intro={
        <>
          <p>Stuck on a level, found a bug, or have an idea? Email us and we will get back to you as soon as we can.</p>
          <a className={styles.email} href={`mailto:${email}?subject=${encodeURIComponent(`${game.name} support`)}`}>
            {email}
          </a>
        </>
      }
      title={game.name}>
      {faqs.map((faq) => (
        <ProseSection key={faq.question} title={faq.question}>
          <p>{faq.answer}</p>
        </ProseSection>
      ))}
      <p className={styles.footnote}>
        {game.name} collects no personal information, only anonymous gameplay summaries. See the{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </ProsePage>
  );
}
