import Image from 'next/image';

import { appStoreBadgeSrc, storeCta } from '@/lib/site';

import styles from './store-cta.module.css';

/**
 * Where to get the game. On the App Store: Apple's badge, unmodified, at least 40pt tall with a quarter of its height
 * clear around it. Before that: that it's coming, and a beta invitation when there's a public TestFlight link.
 */
export function StoreCta() {
  const cta = storeCta();
  if (cta.kind === 'download') {
    return (
      <a aria-label={cta.label} className={styles.badge} href={cta.href} rel="noreferrer" target="_blank">
        <Image alt={cta.label} height={54} priority src={appStoreBadgeSrc} unoptimized width={162} />
      </a>
    );
  }
  return (
    <div className={styles.soon}>
      {cta.betaHref ? (
        <a className={styles.pill} href={cta.betaHref} rel="noreferrer" target="_blank">
          Join the beta
        </a>
      ) : null}
      <span className={styles.chip}>Coming soon to iPhone</span>
    </div>
  );
}

/** Apple's trademark notice, required wherever its badge appears. */
export function AppleTrademarkNotice() {
  if (storeCta().kind !== 'download') return null;
  return (
    <p className={styles.notice}>
      Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries and regions. App
      Store is a service mark of Apple Inc.
    </p>
  );
}
