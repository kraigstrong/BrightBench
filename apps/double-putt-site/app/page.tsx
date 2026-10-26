import type { Metadata } from 'next';
import Image from 'next/image';

import { LoopVideo } from '@/components/loop-video';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { StoreCta } from '@/components/store-cta';
import { TrailerPlayer } from '@/components/trailer-player';
import { beats, courses, game, siteOrigin, storeCta, totalHoles } from '@/lib/site';

import styles from './page.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

function structuredData() {
  const origin = siteOrigin();
  const cta = storeCta();
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    applicationCategory: 'GameApplication',
    author: { '@type': 'Person', name: game.developer },
    description: game.oneLiner,
    gamePlatform: ['iPhone'],
    genre: ['Puzzle', 'Sports'],
    image: `${origin}/og.png`,
    name: game.name,
    numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
    operatingSystem: 'iOS 17 or later',
    playMode: 'SinglePlayer',
    trailer: {
      '@type': 'VideoObject',
      contentUrl: `${origin}/trailer.mp4`,
      description: game.oneLiner,
      name: `${game.name} trailer`,
      thumbnailUrl: `${origin}/trailer-poster.jpg`,
      uploadDate: '2026-10-24',
    },
    url: `${origin}/`,
    ...(cta.kind === 'download' ? { installUrl: cta.href } : {}),
  };
}

/** A ball as the game draws it: white, with a stripe in its green's color. */
function Ball({ color }: { color: string }) {
  return (
    <svg aria-hidden="true" className={styles.ball} viewBox="0 0 40 40">
      <defs>
        <clipPath id={`ball-${color.slice(1)}`}>
          <circle cx="20" cy="20" r="19" />
        </clipPath>
      </defs>
      <g clipPath={`url(#ball-${color.slice(1)})`}>
        <circle cx="20" cy="20" r="19" fill="#e8ebef" />
        <rect fill={color} height="40" width="13" x="13.5" />
        <circle cx="26" cy="27" fill="#000" fillOpacity="0.12" r="17" />
        <ellipse cx="13.5" cy="12" fill="#fff" fillOpacity="0.85" rx="5.5" ry="4" />
      </g>
      <circle cx="20" cy="20" fill="none" r="19" stroke="#000" strokeOpacity="0.22" strokeWidth="1.5" />
    </svg>
  );
}

export default function DoublePuttPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
      <SiteHeader overlay />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A mini golf puzzle game for {game.platform}</p>
            <h1 className={styles.wordmark}>
              <span aria-hidden="true" className={styles.balls}>
                <Ball color="#ff8a3d" />
                <Ball color="#8f6bff" />
              </span>
              <span className={styles.double}>Double</span> <span className={styles.putt}>Putt</span>
            </h1>
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
          </div>
          <div className={styles.heroMedia}>
            <LoopVideo className={styles.heroVideo} eager poster="/hero-poster.jpg" src="/hero.mp4" />
          </div>
        </section>

        <section aria-labelledby="how-it-plays" className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="how-it-plays">
              Two greens. One swing.
            </h2>
            <p className={styles.sectionLede}>
              Every hole is two greens side by side, each with its own ball and cup, and every swing moves both balls.
            </p>
          </div>
          <ol className={styles.beats}>
            {beats.map((beat, index) => (
              <li className={styles.beat} key={beat.title}>
                <div className={styles.shot}>
                  <Image
                    alt={beat.alt}
                    height={1564}
                    sizes="(max-width: 860px) 92vw, 360px"
                    src={beat.image}
                    style={{ objectPosition: beat.focus }}
                    width={720}
                  />
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

        <section aria-labelledby="courses" className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="courses">
              Nine courses. {totalHoles} holes.
            </h2>
            <p className={styles.sectionLede}>
              From a spring meadow to a space station. Each course is a round of nine holes, and each brings something
              new to play off.
            </p>
          </div>
        </section>
        <div aria-label="The courses" className={styles.courses} role="region" tabIndex={0}>
          <ol className={styles.courseRow}>
            {courses.map((course, index) => (
              <li className={styles.course} key={course.slug}>
                <div className={styles.courseMedia}>
                  <LoopVideo
                    className={styles.courseVideo}
                    label={course.alt}
                    poster={`/courses/${course.slug}-poster.jpg`}
                    src={`/courses/${course.slug}.mp4`}
                  />
                </div>
                <h3 className={styles.courseName}>
                  <span aria-hidden="true" className={styles.courseNumber}>
                    {index + 1}
                  </span>
                  {course.name}
                </h3>
                <p className={styles.courseLine}>{course.line}</p>
              </li>
            ))}
          </ol>
        </div>

        <section aria-labelledby="trailer-title" className={styles.section} id="trailer">
          <div className={`${styles.sectionHead} ${styles.centred}`}>
            <h2 className={styles.sectionTitle} id="trailer-title">
              Watch the trailer
            </h2>
          </div>
          <TrailerPlayer
            length="0:26"
            poster="/trailer-poster.jpg"
            src="/trailer.mp4"
            title={`${game.name} trailer`}
          />
        </section>

        <section aria-labelledby="get-it" className={`${styles.section} ${styles.closing}`}>
          <h2 className={styles.closingTitle} id="get-it">
            Chase the double ace.
          </h2>
          <p className={styles.sectionLede}>Every hole has one swing that drops both balls.</p>
          <StoreCta />
          <p className={styles.promise}>No ads. No accounts. Plays offline.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
