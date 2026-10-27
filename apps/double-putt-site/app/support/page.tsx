import type { Metadata } from 'next';
import Link from 'next/link';

import { ProsePage, ProseSection } from '@/components/prose-page';
import { contactEmail, faqs, game } from '@/lib/site';

import styles from './support.module.css';

// The App Store listing's Support URL. Keep the answers in step with the game (kraigstrong/double-putt's README).

export const metadata: Metadata = {
  alternates: { canonical: '/support' },
  description: `Help with ${game.name}, a mini golf puzzle game for ${game.platform}.`,
  title: 'Support',
};

export default function DoublePuttSupportPage() {
  return (
    <ProsePage
      eyebrow="Support"
      intro={
        <>
          <p>Stuck on a hole, found a bug, or have an idea? Write any time.</p>
          <a className={styles.email} href={`mailto:${contactEmail}?subject=${encodeURIComponent(game.name)}`}>
            {contactEmail}
          </a>
        </>
      }
      title={`${game.name} help`}>
      {faqs.map((faq) => (
        <ProseSection key={faq.question} title={faq.question}>
          <p>{faq.answer}</p>
        </ProseSection>
      ))}
      <p className={styles.footnote}>
        {game.name} plays on {game.platform}. It needs {game.requirements} See the{' '}
        <Link href="/privacy">privacy policy</Link> for what the game sends and keeps.
      </p>
    </ProsePage>
  );
}
