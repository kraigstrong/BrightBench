import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { AppStoreBadgeLink } from '@/components/app-store-badge-link';
import { CircuitThread } from '@/components/circuit-thread';
import { circuits, ghostThread, ghostThreadCta } from '@/lib/ghost-thread';
import { getPublicSiteOrigin } from '@/lib/site';
import { studio } from '@/lib/studio';

import styles from './ghost-thread.module.css';

const title = 'Ghost Thread: one-touch racing for iPhone and iPad | BrightBench';
const description = `${ghostThread.oneLiner} Race your own ghost, other players' and your friends'.`;

export const metadata: Metadata = {
  alternates: { canonical: '/ghost-thread' },
  description,
  // A page's openGraph replaces the root's whole, so it names the site again.
  openGraph: { description, siteName: studio.name, title, type: 'website', url: '/ghost-thread' },
  title,
  twitter: { card: 'summary_large_image', description, title },
};

const numbers = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const circuitCount = numbers[circuits.length] ?? String(circuits.length);
const otherCount = (numbers[circuits.length - 1] ?? String(circuits.length - 1)).toLowerCase();

const beats = [
  {
    title: 'One touch.',
    body: 'Hold anywhere to steer up. Let go to steer down. The camera turns with the track, so the road ahead always runs left to right.',
  },
  {
    title: 'Straight is fast.',
    body: 'Speed comes from how straight you drive. Hug the inside and you crawl. Swing wide, clip the apex and run out wide, and you carry the speed.',
  },
  {
    title: 'Beat your ghost.',
    body: 'Your best lap replays as a blue ghost. Splits at every sector and a live delta show which corner the time goes in.',
  },
];

const features = [
  {
    title: 'A rival ghost',
    body: "A gold ghost a little faster than your best: another player's lap, or a bot on the ideal line. Beat it and a new one takes its place.",
  },
  { title: 'Race a friend', body: 'Pick a Game Center friend and race their best lap on any circuit.' },
  {
    title: 'Medals',
    body: 'Bronze, silver, gold and platinum on every circuit, and each one a Game Center achievement.',
  },
  {
    title: 'Leaderboards',
    body: 'Every circuit has its own Game Center leaderboard, and each session ends with where your lap stands.',
  },
  {
    title: 'Apex School',
    body: 'A short lesson in the racing line: when to turn in, where the apex is, and how to run out wide.',
  },
  { title: 'Share a lap', body: 'A picture of your best lap: the circuit drawn to scale, with your line on it.' },
];

function structuredData() {
  const origin = getPublicSiteOrigin();
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    applicationCategory: 'GameApplication',
    author: { '@type': 'Person', name: studio.developer },
    description: ghostThread.oneLiner,
    gamePlatform: ['iPhone', 'iPad'],
    genre: ['Racing'],
    image: `${origin}/games/ghost-thread/icon.png`,
    name: ghostThread.name,
    numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
    operatingSystem: 'iOS 17 or later, iPadOS 17 or later',
    playMode: 'SinglePlayer',
    url: `${origin}/ghost-thread`,
  };
}

/** The App Store's badge once the game's there; until then, the beta. */
function GetIt() {
  const cta = ghostThreadCta();
  if (cta.kind === 'download') return <AppStoreBadgeLink href={cta.href} />;
  return (
    <div className={styles.cta}>
      <a className={styles.beta} href={cta.href} rel="noreferrer" target="_blank">
        Join the beta on TestFlight
      </a>
      <p className={styles.ctaNote}>Coming soon to the App Store.</p>
    </div>
  );
}

export default function GhostThreadPage() {
  const [hero] = circuits;
  return (
    <div className={styles.page}>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <Image alt="" className={styles.icon} height={44} priority src="/games/ghost-thread/icon.png" width={44} />A
            one-touch racing game for {ghostThread.platform}
          </p>
          <h1 className={styles.logo}>
            <Image alt={ghostThread.name} height={112} priority src="/games/ghost-thread/logo.png" width={600} />
          </h1>
          <p className={styles.tagline}>{ghostThread.tagline}</p>
          <p className={styles.pitch}>
            <span>Hold to steer up. Let go to steer down.</span>
            <span>Find the straightest line through every corner.</span>
          </p>
          <GetIt />
        </div>
        <div className={styles.heroCircuit}>
          <CircuitThread circuit={hero} />
          <p className={styles.heroName}>{hero.name}</p>
        </div>
      </section>

      <section aria-labelledby="how-it-plays" className={styles.section}>
        <h2 className={styles.sectionTitle} id="how-it-plays">
          How it plays
        </h2>
        <ol className={styles.beats}>
          {beats.map((beat, index) => (
            <li className={styles.beat} key={beat.title}>
              <span aria-hidden="true" className={styles.beatNumber}>
                {index + 1}
              </span>
              <h3 className={styles.beatTitle}>{beat.title}</h3>
              <p className={styles.body}>{beat.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="circuits" className={styles.section}>
        <h2 className={styles.sectionTitle} id="circuits">
          {circuitCount} circuits.
        </h2>
        <p className={styles.lede}>
          Each one original, with its own character. A good lap is about 30 seconds. The yellow
          thread is each one&apos;s ideal line, lapped at the speed it allows.
        </p>
        <ul className={styles.circuits}>
          {circuits.map((circuit, index) => (
            <li className={styles.circuit} key={circuit.id}>
              <CircuitThread circuit={circuit} offset={index * 1.7} />
              <h3 className={styles.circuitName}>
                {circuit.name}
                {circuit.name === ghostThread.freeCircuit ? <span className={styles.free}>Free</span> : null}
              </h3>
              <p className={styles.circuitFacts}>
                {circuit.corners} corners · {circuit.clockwise ? 'clockwise' : 'counterclockwise'}
              </p>
              <p className={styles.body}>{circuit.summary}</p>
            </li>
          ))}
        </ul>
        <p className={styles.lede}>
          {ghostThread.freeCircuit} is free, with Apex School to learn the line. One purchase opens the other{' '}
          {otherCount}, and every circuit added later.
        </p>
      </section>

      <section aria-labelledby="chase" className={styles.section}>
        <h2 className={styles.sectionTitle} id="chase">
          Always someone to chase.
        </h2>
        <ul className={styles.features}>
          {features.map((feature) => (
            <li className={styles.feature} key={feature.title}>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.body}>{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="get-it" className={`${styles.section} ${styles.closing}`}>
        <h2 className={styles.closingTitle} id="get-it">
          Find the line.
        </h2>
        <GetIt />
        <p className={styles.promise}>{studio.promise}</p>
        <nav aria-label="Ghost Thread" className={styles.links}>
          <Link href="/ghost-thread/support">Support</Link>
          <Link href="/ghost-thread/privacy">Privacy</Link>
        </nav>
      </section>
    </div>
  );
}
