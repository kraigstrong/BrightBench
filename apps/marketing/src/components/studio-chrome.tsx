import Link from 'next/link';

import { games, sparkPath, studio } from '@/lib/studio';

import styles from './studio-chrome.module.css';

/** BrightBench's mark: a small gold spark beside the name. */
export function Spark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path d={sparkPath} fill="currentColor" />
    </svg>
  );
}

function Brand() {
  return (
    <Link className={styles.brand} href="/">
      <Spark className={styles.spark} />
      <span>{studio.name}</span>
    </Link>
  );
}

export function StudioHeader() {
  return (
    <header className={styles.header}>
      <Brand />
      <nav aria-label="Site" className={styles.nav}>
        <Link href="/play">Play</Link>
        <Link href="/learn">Learn</Link>
        <Link href="/support">Support</Link>
      </nav>
    </header>
  );
}

export function StudioFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerRow}>
        <Brand />
        <nav aria-label="Footer" className={styles.footerNav}>
          <Link href="/play">Play</Link>
          <Link href="/learn">Learn</Link>
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
      <div className={styles.footerLists}>
        <div>
          <p className={styles.footerHeading}>Games</p>
          <ul className={styles.footerList}>
            {games.map((game) => (
              <li key={game.slug}>
                <a href={game.url}>{game.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.footerHeading}>Learning apps</p>
          <ul className={styles.footerList}>
            <li>
              <Link href="/products/time-tutor">Time Tutor</Link>
            </li>
            <li>
              <Link href="/products/math-reef">Math Reef</Link>
            </li>
            <li>
              <Link href="/learn#guides">Guides for grown-ups</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className={styles.legal}>
        © {new Date().getFullYear()} {studio.developer}. {studio.tagline}
      </p>
    </footer>
  );
}
