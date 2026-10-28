import type { Metadata } from 'next';
import Link from 'next/link';

import { ProsePage, ProseSection } from '@/components/prose-page';
import { game } from '@/lib/game';
import { contactEmail } from '@/lib/site';

import styles from './support.module.css';

// Keep answers in step with the game (kraigstrong/bigger-fish): what's free in ArcadeUnlock.swift, the sound
// switches in SettingsView.swift and the pause menu (GameScene.swift), the iOS deployment target.

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
      'Shallow Reef is free, and so are the first two levels of every other world and 5 Open Water runs a day. One $4.99 purchase unlocks the rest: every world and Deep End, and as many Open Water runs as you like.',
  },
  {
    question: 'How do new worlds open?',
    answer:
      "In Adventure, every world is open from the start, so you can try each one. Beat a world's tenth level to open its Deep End: five harder levels, each opening when you clear the one before.",
  },
  {
    question: 'What is the Open Water?',
    answer:
      "An endless run through all five worlds, with a new level every time, until a bigger fish eats you. Choose Open Water on the home screen. Without the purchase you get 5 runs a day, and a run counts once you take its first pearl.",
  },
  {
    question: 'What are pearls for?',
    answer:
      "You gather pearls in the Open Water and spend them in the pearl shop (Shop on the home screen) on colors, patterns, hats, faces and trails for your fish. Looks don't change how the game plays. Pearls are only earned by playing; they're never sold.",
  },
  {
    question: 'How do I turn off the music or sound effects?',
    answer:
      'Tap the gear on the home screen, or pause during a run. Sound effects, Music, and Vibration each have their own switch, and the settings are remembered.',
  },
  {
    question: 'Does it need the internet?',
    answer:
      'No. Bigger Fish plays offline. When a connection is available, it sends anonymous gameplay summaries, described in the privacy policy.',
  },
  {
    question: 'Is my progress saved?',
    answer:
      'Yes. Progress, pearls and looks are saved on your device and backed up to your iCloud account, so they carry over to your other iPhone or iPad, and to a new one.',
  },
  {
    question: 'What does it run on?',
    answer: `${game.requirements} Made for iPhone Duo.`,
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
