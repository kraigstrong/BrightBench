import Image from 'next/image';
import Link from 'next/link';

import { brightBenchUrl, contactEmail, game } from '@/lib/site';

import { AppleTrademarkNotice } from './store-cta';
import styles from './site-chrome.module.css';

function Brand({ size }: { size: number }) {
  return (
    <Link className={styles.brand} href="/">
      <Image alt="" className={styles.icon} height={size} priority src="/icon-1024.png" width={size} />
      <span>{game.name}</span>
    </Link>
  );
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? `${styles.header} ${styles.overlay}` : styles.header}>
      <Brand size={36} />
      <nav aria-label="Site" className={styles.nav}>
        <Link href="/support">Support</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerRow}>
        <Brand size={32} />
        <nav aria-label="Footer" className={styles.footerNav}>
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={`mailto:${contactEmail}`}>Contact</a>
        </nav>
      </div>
      <p className={styles.legal}>
        © {new Date().getFullYear()} {game.developer}. A mini golf puzzle game for {game.platform}. Part of{' '}
        <a href={brightBenchUrl}>BrightBench</a>.
      </p>
      <AppleTrademarkNotice />
    </footer>
  );
}
