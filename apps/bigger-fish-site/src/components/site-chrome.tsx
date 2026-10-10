import Image from 'next/image';
import Link from 'next/link';

import { game } from '@/lib/game';
import { contactEmail } from '@/lib/site';

import { AppleTrademarkNotice } from './store-cta';
import styles from './site-chrome.module.css';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? `${styles.header} ${styles.overlay}` : styles.header}>
      <Link className={styles.brand} href="/">
        <Image alt="" className={styles.icon} height={36} priority src="/press/bigger-fish-icon-1024.png" width={36} />
        <span>{game.name}</span>
      </Link>
      <nav aria-label="Site" className={styles.nav}>
        <Link href="/press">Press</Link>
        <Link href="/support">Support</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const email = contactEmail();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerRow}>
        <Link className={styles.brand} href="/">
          <Image alt="" className={styles.icon} height={32} src="/press/bigger-fish-icon-1024.png" width={32} />
          <span>{game.name}</span>
        </Link>
        <nav aria-label="Footer" className={styles.footerNav}>
          <Link href="/press">Press kit</Link>
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={`mailto:${email}`}>Contact</a>
        </nav>
      </div>
      <p className={styles.legal}>
        © {new Date().getFullYear()} {game.developer}. A one-touch arcade game for iPhone.
      </p>
      <AppleTrademarkNotice />
    </footer>
  );
}
