import type { Metadata } from 'next';
import Image from 'next/image';

import { LoopVideo } from '@/components/loop-video';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { StoreCta } from '@/components/store-cta';
import { TrailerPlayer } from '@/components/trailer-player';
import { beats, game, totalLevels, worlds } from '@/lib/game';
import { siteOrigin, storeCta } from '@/lib/site';

import styles from './page.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

function structuredData() {
  const cta = storeCta();
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    applicationCategory: 'GameApplication',
    author: { '@type': 'Person', name: game.developer },
    description: game.oneLiner,
    gamePlatform: game.platform,
    genre: 'Arcade',
    image: `${siteOrigin()}/press/bigger-fish-key-art.png`,
    name: game.name,
    numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
    operatingSystem: 'iOS 17 or later',
    playMode: 'SinglePlayer',
    trailer: {
      '@type': 'VideoObject',
      contentUrl: `${siteOrigin()}/media/bigger-fish-trailer.mp4`,
      description: game.oneLiner,
      name: `${game.name} trailer`,
      thumbnailUrl: `${siteOrigin()}/media/trailer-poster.jpg`,
      uploadDate: '2026-10-09',
    },
    url: siteOrigin(),
    ...(cta.kind === 'comingSoon' ? {} : { installUrl: cta.href }),
  };
}

export default function HomePage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
      <SiteHeader overlay />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroMedia}>
            <LoopVideo className={styles.heroVideo} eager poster="/media/hero-poster.jpg" src="/media/hero.mp4" />
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A one-touch arcade game for iPhone</p>
            <h1 className={styles.wordmark}>{game.name}</h1>
            <p className={styles.tagline}>{game.tagline}</p>
            <p className={styles.pitch}>
              {game.pitch.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <div className={styles.ctaRow}>
              <StoreCta />
              <a className={styles.trailerButton} href="#trailer">
                <svg aria-hidden="true" height="14" viewBox="0 0 24 24" width="14">
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
                Watch the trailer
              </a>
            </div>
            <p className={styles.offer}>{game.offer}</p>
          </div>
        </section>

        <section aria-labelledby="how-it-plays" className={styles.section}>
          <h2 className={styles.visuallyHidden} id="how-it-plays">
            How it plays
          </h2>
          <ol className={styles.beats}>
            {beats.map((beat, index) => (
              <li className={styles.beat} key={beat.title}>
                <div className={styles.shot}>
                  <Image alt={beat.alt} height={1200} sizes="(max-width: 860px) 92vw, 380px" src={beat.image} width={1600} />
                </div>
                <h3 className={styles.beatTitle}>
                  <span aria-hidden="true" className={styles.beatNumber}>
                    {index + 1}
                  </span>
                  {beat.title}
                </h3>
                <p className={styles.beatBody}>{beat.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="worlds" className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="worlds">
              Four worlds. {totalLevels} levels.
            </h2>
            <p className={styles.sectionLede}>
              Each world changes the hunt. Clear its ten levels, then dive into the Deep End.
            </p>
          </div>
          <div className={styles.worlds}>
            {worlds.map((world) => (
              <article className={`${styles.world} ${styles[world.slug] ?? ''}`} key={world.slug}>
                <div className={styles.worldMedia}>
                  <LoopVideo
                    className={styles.worldVideo}
                    poster={`/media/worlds/${world.slug}-poster.jpg`}
                    src={`/media/worlds/${world.slug}.mp4`}
                  />
                </div>
                <div className={styles.worldCopy}>
                  <h3 className={styles.worldName}>{world.name}</h3>
                  <p className={styles.worldMotto}>{world.motto}</p>
                  <p className={styles.worldLine}>{world.line}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="trailer-title" className={styles.section} id="trailer">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="trailer-title">
              Watch the trailer
            </h2>
          </div>
          <TrailerPlayer
            poster="/media/trailer-poster.jpg"
            src="/media/bigger-fish-trailer.mp4"
            title={`${game.name} trailer`}
          />
        </section>

        <section aria-labelledby="get-it" className={`${styles.section} ${styles.closing}`}>
          <h2 className={styles.closingTitle} id="get-it">
            How big can you get?
          </h2>
          <StoreCta />
          <p className={styles.offer}>{game.offer}</p>
          <p className={styles.promise}>No ads. No accounts. Plays offline.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
