import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LoopVideo } from '@/components/loop-video';
import { games, studio } from '@/lib/studio';

import styles from './play.module.css';

const title = 'Games for iPhone and iPad | BrightBench';
const description =
  'Family-friendly games from BrightBench: Bigger Fish, a one-touch arcade game, and Double Putt, a mini golf puzzle game. No ads, no accounts, and they play offline.';

export const metadata: Metadata = {
  alternates: { canonical: '/play' },
  description,
  // A page's openGraph replaces the root's whole, so it names the site again.
  openGraph: { description, siteName: studio.name, title, type: 'website', url: '/play' },
  title,
  twitter: { card: 'summary_large_image', description, title },
};

export default function PlayPage() {
  return (
    <>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>BrightBench games</p>
        <h1 className={styles.headline}>Family-friendly games for iPhone and iPad.</h1>
        <p className={styles.lede}>
          Quick to pick up, and made for one more try. {studio.promise}
        </p>
        <nav aria-label="Games" className={styles.jump}>
          {games.map((game) => (
            <a href={`#${game.slug}`} key={game.slug}>
              <Image alt="" className={styles.jumpIcon} height={28} src={game.icon} width={28} />
              {game.name}
            </a>
          ))}
        </nav>
      </section>

      {games.map((game) => (
        <section
          aria-labelledby={`${game.slug}-title`}
          className={`${styles.game} ${styles[game.slug] ?? ''} ${
            game.video.orientation === 'portrait' ? styles.portrait : styles.landscape
          }`}
          id={game.slug}
          key={game.slug}>
          <div className={styles.gameMedia}>
            <LoopVideo
              className={styles.gameVideo}
              label={game.alt}
              poster={game.video.poster}
              src={game.video.src}
            />
          </div>
          <div className={styles.gameCopy}>
            <p className={styles.genre}>{game.genre}</p>
            <h2 className={styles.gameName} id={`${game.slug}-title`}>
              <a href={game.url}>
                <Image alt="" className={styles.gameIcon} height={56} src={game.icon} width={56} />
                {game.name}
              </a>
            </h2>
            <p className={styles.gameTagline}>{game.tagline}</p>
            <p className={styles.pitch}>
              {game.pitch.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <ul aria-label={`${game.name} at a glance`} className={styles.facts}>
              <li className={styles.status}>{game.status}</li>
              {game.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className={styles.ctaRow}>
              <a className={styles.visit} href={game.url}>
                Visit {game.domain}
              </a>
              <a className={styles.trailer} href={game.trailerUrl}>
                <svg aria-hidden="true" height="14" viewBox="0 0 24 24" width="14">
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
                Watch the {game.name} trailer
              </a>
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="learn-too" className={styles.learn}>
        <div className={styles.learnFox} aria-hidden="true">
          <Image alt="" fill sizes="160px" src="/mascots/brightbench-fox-jumping.png" />
        </div>
        <div className={styles.learnCopy}>
          <h2 className={styles.learnTitle} id="learn-too">
            Looking for learning apps?
          </h2>
          <p className={styles.learnLine}>
            BrightBench also makes small apps for tricky elementary skills, like telling time and math facts.
          </p>
        </div>
        <Link className={styles.learnCta} href="/learn">
          See the learning apps
        </Link>
      </section>
    </>
  );
}
