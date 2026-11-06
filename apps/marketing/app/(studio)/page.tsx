import { Fragment, type CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

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

/**
 * The learning apps with a card to lay on the Learn door, two of them as on Play. The first listed lies on top: Time
 * Tutor's screen is at its card's right, where the top card would cover it, and Math Reef's name and fish are at its
 * left, clear of the corner the top card covers.
 */
const learnCards = featuredProductCards
  .flatMap(({ keyArt, name }) => (keyArt ? [{ keyArt, name }] : []))
  .slice(0, 2)
  .reverse();

/** A tile's line that wraps between words but never at a word's own hyphen, as "mid-November" would. */
function Words({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    <Fragment key={index}>
      {index > 0 ? ' ' : null}
      {word.includes('-') ? <span className={styles.noBreak}>{word}</span> : word}
    </Fragment>
  ));
}

export default function StudioHomePage() {
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
              {/* Two cards on the table, as the share image lays them (opengraph-image.tsx); every game is listed below. */}
              {games.slice(0, 2).map((game) => (
                <div className={styles.keyArt} key={game.slug}>
                  <Image alt="" fill priority sizes="(max-width: 860px) 56vw, 330px" src={game.keyArt} />
                </div>
              ))}
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
                    <span className={styles.titleMeta}>
                      <Words text={game.status} />
                    </span>
                  </span>
                  {game.url.startsWith('/') ? <Arrow /> : <OutArrow />}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="door-learn" className={`${styles.door} ${styles.learn}`}>
          <div className={styles.doorMain}>
            <div className={styles.learnMedia}>
              {/* Each app's card, laid as the games' are on Play; every app is listed below. */}
              {learnCards.map((app) => (
                <div className={styles.keyArt} key={app.name}>
                  <Image alt="" fill priority sizes="(max-width: 860px) 56vw, 330px" src={app.keyArt} />
                </div>
              ))}
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
                  {app.icon ? (
                    <Image alt="" className={styles.titleIcon} height={40} src={app.icon} width={40} />
                  ) : (
                    <span aria-hidden="true" className={styles.titleDot} />
                  )}
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
