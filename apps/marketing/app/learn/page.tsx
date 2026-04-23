import type { Metadata } from 'next';
import Link from 'next/link';

import { learnPages } from '@/lib/site';
import styles from '../discovery.module.css';

export const metadata: Metadata = {
  alternates: {
    canonical: '/learn',
  },
  description:
    'BrightBench learning guides. Currently: Time Tutor telling time skills (time telling games, analog clock practice, set-the-clock practice, read-the-clock practice, and elapsed time).',
  openGraph: {
    description:
      'BrightBench learning guides. Currently: Time Tutor telling time skills (time telling games, analog clock practice, set-the-clock practice, read-the-clock practice, and elapsed time).',
    title: 'Learn | BrightBench',
    type: 'website',
    url: '/learn',
  },
  title: 'Learn | BrightBench',
  twitter: {
    card: 'summary_large_image',
    description:
      'BrightBench learning guides. Currently: Time Tutor telling time skills (time telling games, analog clock practice, set-the-clock practice, read-the-clock practice, and elapsed time).',
    title: 'Learn | BrightBench',
  },
};

export default function LearnIndexPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/">
        Back to BrightBench
      </Link>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Guides</p>
        <h1 className={styles.heroTitle}>Small guides for tricky skills</h1>
        <div className={styles.intro}>
          <p className={styles.lead}>
            BrightBench is a suite of simple learning apps. These guides help you find
            the right kind of practice without needing to know the whole lineup.
          </p>
          <p className={styles.lead}>
            Right now, our guides focus on <strong>Time Tutor</strong> (telling time).
            More guides will appear as other apps ship.
          </p>
        </div>
        <div className={styles.ctaRow}>
          <Link className={styles.primaryButton} href="/products/time-tutor">
            See Time Tutor
          </Link>
          <a
            className={styles.secondaryButton}
            href="#time-tutor-guides">
            Browse clock guides
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle} id="time-tutor-guides">
          Time Tutor: telling time guides
        </h2>
        <div className={styles.relatedGrid}>
          {learnPages.map((page) => (
            <article className={styles.relatedCard} key={page.slug}>
              <Link className={styles.relatedLink} href={`/learn/${page.slug}`}>
                {page.h1}
              </Link>
              <p className={styles.relatedDescription}>{page.metaDescription}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>More guides are coming</h2>
        <div className={styles.sectionBody}>
          <p>
            As BrightBench adds more apps (fractions, literacy, and place value),
            this page will expand into separate guide collections so it stays clear
            which app each guide supports.
          </p>
        </div>
      </section>
    </main>
  );
}

