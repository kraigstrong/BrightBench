import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LoopVideo } from '@/components/loop-video';
import { featuredProductCards, getPublicSiteOrigin } from '@/lib/site';
import { games, studio } from '@/lib/studio';

import styles from './page.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

function structuredData() {
  const origin = getPublicSiteOrigin();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${origin}/#studio`,
        '@type': 'Organization',
        description: studio.description,
        name: studio.name,
        url: `${origin}/`,
      },
      {
        '@type': 'WebSite',
        name: studio.name,
        publisher: { '@id': `${origin}/#studio` },
        url: `${origin}/`,
      },
    ],
  };
}

function Arrow() {
  return (
    <svg aria-hidden="true" className={styles.arrow} viewBox="0 0 24 24">
      <path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
    </svg>
  );
}

function OutArrow() {
  return (
    <svg aria-hidden="true" className={styles.outArrow} viewBox="0 0 24 24">
      <path d="M8 16 16 8m-7 0h7v7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
    </svg>
  );
}

export default function StudioHomePage() {
  const [landscape, portrait] = [
    games.find((game) => game.video.orientation === 'landscape'),
    games.find((game) => game.video.orientation === 'portrait'),
  ];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>An independent studio</p>
        <h1 className={styles.wordmark}>{studio.name}</h1>
        <p className={styles.tagline}>{studio.tagline}</p>
        <p className={styles.lede}>
          We make family-friendly games, and small learning apps that help tricky ideas click.
        </p>
      </section>

      <div className={styles.doors}>
        <section aria-labelledby="door-play" className={`${styles.door} ${styles.play}`}>
          <div className={styles.doorMain}>
            <div className={styles.playMedia}>
              {landscape ? (
                <LoopVideo
                  className={styles.playWide}
                  eager
                  poster={landscape.video.poster}
                  src={landscape.video.src}
                />
              ) : null}
              {portrait ? (
                <div className={styles.playTall}>
                  <LoopVideo eager poster={portrait.video.poster} src={portrait.video.src} />
                </div>
              ) : null}
            </div>
            <div className={styles.doorCopy}>
              <h2 className={styles.doorTitle} id="door-play">
                Play
              </h2>
              <p className={styles.doorLine}>Family-friendly games for iPhone and iPad.</p>
              <p className={styles.doorNote}>{studio.promise}</p>
              <Link className={styles.doorCta} href="/play">
                See the games
                <Arrow />
              </Link>
            </div>
          </div>
          <ul aria-label="Our games" className={styles.titles}>
            {games.map((game) => (
              <li key={game.slug}>
                <a className={styles.title} href={game.url}>
                  <Image alt="" className={styles.titleIcon} height={40} src={game.icon} width={40} />
                  <span className={styles.titleText}>
                    <span className={styles.titleName}>{game.name}</span>{' '}
                    <span className={styles.titleMeta}>{game.domain}</span>
                  </span>
                  <OutArrow />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="door-learn" className={`${styles.door} ${styles.learn}`}>
          <div className={styles.doorMain}>
            <div className={styles.learnMedia}>
              <div className={styles.learnFox}>
                <Image
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 860px) 90vw, 520px"
                  src="/mascots/brightbench-fox-sitting.png"
                />
              </div>
            </div>
            <div className={styles.doorCopy}>
              <h2 className={styles.doorTitle} id="door-learn">
                Learn
              </h2>
              <p className={styles.doorLine}>Focused learning apps for tricky elementary skills.</p>
              <p className={styles.doorNote}>Telling time, math facts, fractions and more.</p>
              <Link className={styles.doorCta} href="/learn">
                See the learning apps
                <Arrow />
              </Link>
            </div>
          </div>
          <ul aria-label="Our learning apps" className={styles.titles}>
            {featuredProductCards.map((app) => (
              <li key={app.name}>
                <Link
                  className={styles.title}
                  href={app.href}
                  style={{ '--accent': app.accent } as CSSProperties}>
                  <span aria-hidden="true" className={styles.titleDot} />
                  <span className={styles.titleText}>
                    <span className={styles.titleName}>{app.name}</span>{' '}
                    <span className={styles.titleMeta}>{app.status}</span>
                  </span>
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
