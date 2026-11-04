import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getProductPageBySlug, learnPages, productCards, siteMeta } from '@/lib/site';
import styles from './learn.module.css';

const title = 'Learning Apps for Kids | BrightBench';
const description =
  'BrightBench builds focused educational apps that help tricky elementary concepts feel clear, calm, and approachable: telling time, math facts, fractions and more.';

export const metadata: Metadata = {
  alternates: {
    canonical: '/learn',
  },
  description,
  openGraph: {
    description,
    siteName: siteMeta.title,
    title,
    type: 'website',
    url: '/learn',
  },
  title,
  twitter: {
    card: 'summary_large_image',
    description,
    title,
  },
};

const approachItems = [
  {
    body: 'Each app stays tightly scoped so kids can build confidence without distractions or overload.',
    iconClassName: styles.iconCoral,
    title: 'One skill at a time',
  },
  {
    body: 'We design around seeing, interacting, and understanding — not just memorizing or drilling.',
    iconClassName: styles.iconBlue,
    title: 'Visual and intuitive',
  },
  {
    body: 'No clutter. No bloated curriculum. Just simple tools that help important ideas click.',
    iconClassName: styles.iconTeal,
    title: 'Calm and clear',
  },
] as const;

/** The apps kids can use today, each with its page's account of what it teaches. */
const liveApps = productCards.flatMap((card) => {
  const page = getProductPageBySlug(card.href.replace(/^\/products\//, ''));
  const { icon, showcase } = card;
  return card.availability === 'live' && icon && showcase && page?.kind === 'app'
    ? [{ card, icon, page, showcase }]
    : [];
});

/** The apps still being made, in the order they're coming. */
const upcomingApps = productCards.filter((card) => card.availability !== 'live');

const appStoreBadge = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';

/** The guides teach telling time, alongside Time Tutor: they wear its color. */
const guideAccent = productCards.find((card) => card.name === 'Time Tutor')?.accent;

export default function LearnPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          {siteMeta.title}
          <span className={styles.wordmarkTag}>Learn</span>
        </Link>
        <nav className={styles.nav}>
          <a className={styles.navLink} href="#product-suite">
            Apps
          </a>
          <a className={styles.navLink} href="#guides">
            Guides
          </a>
          <a className={styles.navLink} href="#about">
            About
          </a>
          <Link className={styles.navLink} href="/play">
            Games
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.headline}>
            <span className={styles.headlinePrimary}>Small apps.</span>
            <br />
            <span className={`${styles.noWrap} ${styles.headlineSecondary}`}>
              Big learning moments.
            </span>
          </h1>
          <p className={styles.lead}>Simple learning apps for tricky concepts.</p>
          <p className={styles.body}>
            Some skills need more than repetition. They need the right visual,
            the right interaction, and the right kind of practice.
          </p>
          <p className={styles.body}>
            BrightBench is building a suite of simple, thoughtful apps that
            help kids understand tough concepts with clarity and confidence.
          </p>
          <div className={styles.heroCtaRow}>
            <a className={styles.primaryButton} href="#product-suite">
              Explore the apps
            </a>
            <Link className={styles.secondaryOutlineButton} href="/products/time-tutor">
              Explore Time Tutor now
            </Link>
          </div>
        </div>

        {/* Two moments of practice, as kids see them in the apps: a worked answer and a clock to read. */}
        <div className={styles.heroArt}>
          <div className={styles.heroReef}>
            <Image
              alt="Math Reef after a wrong answer to 7 × 9: the worked math, 7 × 9 = 63."
              fill
              priority
              sizes="(max-width: 900px) 88vw, 500px"
              src="/apps/math-reef/screens/worked-math.jpg"
            />
          </div>
          <div className={styles.heroPhone}>
            <Image
              alt="Time Tutor’s Read the Clock: an analog clock showing 3:25, with pickers to enter the time."
              fill
              priority
              sizes="(max-width: 900px) 38vw, 215px"
              src="/apps/time-tutor/screens/read-the-clock.png"
            />
          </div>
          <p className={`${styles.heroNote} ${styles.heroNoteReef}`}>A miss shows the worked math</p>
          <p className={`${styles.heroNote} ${styles.heroNoteClock}`}>Read an analog clock</p>
          <div aria-hidden="true" className={styles.heroFoxFrame}>
            <Image alt="" className={styles.heroFox} fill sizes="150px" src="/mascots/brightbench-fox-sitting.png" />
          </div>
        </div>
      </section>

      <section className={styles.suiteSection} id="product-suite">
        <div className={styles.suiteHeader}>
          <div className={styles.eyebrow}>The apps</div>
          <h2 className={styles.sectionTitle}>Focused apps for key skills</h2>
          <p className={styles.sectionText}>
            Each BrightBench app is built around one concept and one goal:
            helping kids truly understand it.
          </p>
        </div>

        {liveApps.map(({ card, icon, page, showcase }) => (
          <article
            aria-labelledby={`${page.slug}-name`}
            className={`${styles.appFeature} ${
              showcase.orientation === 'landscape' ? styles.appWide : styles.appTall
            }`}
            key={card.name}
            style={{ '--card-accent': card.accent } as CSSProperties}>
            <div className={styles.appScreens}>
              {showcase.screens.map((screen) => (
                <figure className={styles.appScreen} key={screen.src}>
                  <div className={styles.appScreenFrame}>
                    <Image
                      alt={screen.alt}
                      fill
                      sizes={
                        showcase.orientation === 'landscape'
                          ? '(max-width: 900px) 92vw, 560px'
                          : '(max-width: 900px) 30vw, 190px'
                      }
                      src={screen.src}
                    />
                  </div>
                  <figcaption className={styles.appScreenCaption}>{screen.caption}</figcaption>
                </figure>
              ))}
            </div>

            <div className={styles.appCopy}>
              <div className={styles.appIdentity}>
                <Image alt="" className={styles.appIcon} height={64} src={icon} width={64} />
                <div>
                  <h3 className={styles.appName} id={`${page.slug}-name`}>
                    {card.name}
                  </h3>
                  <p className={styles.appMeta}>
                    {page.audience} · {showcase.skill}
                  </p>
                </div>
              </div>
              <p className={styles.sectionText}>{page.intro[0]}</p>
              <div className={styles.appDetail}>
                <h4 className={styles.appLabel}>What kids practice</h4>
                <ul className={styles.appList}>
                  {page.learningItems.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.appDetail}>
                <h4 className={styles.appLabel}>{showcase.modesLabel}</h4>
                <ul aria-label={`${card.name} ${showcase.modesLabel.toLowerCase()}`} className={styles.appModes}>
                  {page.modeItems.map((mode) => (
                    <li key={mode.title}>{mode.title}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.appCtaRow}>
                {card.appStoreUrl ? (
                  <a className={styles.appStoreButton} href={card.appStoreUrl} rel="noreferrer" target="_blank">
                    <Image
                      alt={`Download ${card.name} on the App Store`}
                      className={styles.appStoreBadge}
                      height={40}
                      src={appStoreBadge}
                      unoptimized
                      width={120}
                    />
                  </a>
                ) : null}
                <Link className={styles.appMore} href={card.href}>
                  More about {card.name}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleBlock}>
          <div className={styles.eyebrow}>Our approach</div>
          <h2 className={styles.sectionTitle}>Focused by design</h2>
        </div>
        <div className={styles.approachGrid}>
          {approachItems.map((item) => (
            <article className={styles.approachCard} key={item.title}>
              <span className={`${styles.approachIcon} ${item.iconClassName}`} />
              <h3 className={styles.approachTitle}>{item.title}</h3>
              <p className={styles.sectionText}>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="guides">
        <div className={styles.suiteHeader}>
          <div className={styles.eyebrow}>Guides</div>
          <h2 className={styles.sectionTitle}>Guides for parents and teachers</h2>
          <p className={styles.sectionText}>
            Short, practical guides to the skills our apps teach. Right now they
            cover telling time, the skill Time Tutor practices.
          </p>
        </div>
        <div className={styles.guideGrid}>
          {learnPages.map((page) => (
            <article
              className={styles.suiteCard}
              key={page.slug}
              style={{ '--card-accent': guideAccent } as CSSProperties}>
              <h3 className={styles.guideTitle}>
                <Link className={styles.cardLink} href={`/learn/${page.slug}`}>
                  {page.h1}
                </Link>
              </h3>
              <p className={styles.guideBody}>{page.metaDescription}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.roadmap}>
          <div className={styles.roadmapTop}>
            <div className={styles.roadmapIntro}>
              <h2 className={styles.sectionTitle}>More apps are on the way</h2>
              <p className={styles.sectionText}>
                We’re actively building the next set of BrightBench apps around
                other tricky elementary concepts, including fractions, early
                literacy, and place value.
              </p>
              <p className={styles.supportingLine}>
                If a concept is hard to teach well, it deserves a better tool.
              </p>
            </div>
            <div className={styles.roadmapFoxWrap} aria-hidden="true">
              <div className={styles.roadmapFoxHalo} />
              <div className={styles.roadmapFoxFrame}>
                <Image
                  alt=""
                  className={styles.roadmapFox}
                  fill
                  sizes="96px"
                  src="/mascots/brightbench-fox-jumping.png"
                />
              </div>
            </div>
          </div>
          <div className={styles.roadmapRows}>
            {upcomingApps.map((app) => (
              <div
                className={styles.roadmapRow}
                key={app.name}
                style={{ '--card-accent': app.accent } as CSSProperties}>
                <div className={styles.roadmapApp}>
                  <span aria-hidden="true" className={styles.roadmapDot} />
                  <div>
                    <div className={styles.roadmapName}>{app.name}</div>
                    <p className={styles.roadmapBlurb}>{app.blurb}</p>
                  </div>
                </div>
                <div
                  className={`${styles.roadmapStatus} ${
                    app.availability === 'in-progress'
                      ? styles.roadmapInProgress
                      : styles.roadmapPlanned
                  }`}>
                  {app.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.aboutSection}`} id="about">
        <div className={styles.aboutCopy}>
          <div className={styles.eyebrow}>About</div>
          <h2 className={styles.sectionTitle}>A better kind of learning app</h2>
          <p className={styles.sectionText}>
            BrightBench is an independent studio. On this side of it, we build
            educational apps for elementary learners, because the hardest
            concepts to teach deserve tools that are simpler, more visual, and
            more thoughtfully designed.
          </p>
          <p className={styles.sectionText}>
            Our goal is not to build a giant curriculum platform. It is to
            create focused apps that help important ideas feel clear, intuitive,
            and even fun.
          </p>
          <p className={styles.sectionText}>
            We make games too: see{' '}
            <Link className={styles.inlineLink} href="/play">
              BrightBench games
            </Link>
            .
          </p>
        </div>

        <div className={styles.aboutFoxWrap} aria-hidden="true">
          <div className={styles.aboutFoxHalo} />
          <div className={styles.aboutFoxFrame}>
            <Image
              alt=""
              className={styles.aboutFox}
              fill
              sizes="102px"
              src="/mascots/brightbench-fox-magnifying-glass.png"
            />
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Link className={styles.wordmark} href="/">
            {siteMeta.title}
          </Link>
          <p className={styles.footerLine}>Small apps. Big learning moments.</p>
        </div>

        <nav className={styles.footerNav}>
          <a className={styles.navLink} href="#product-suite">
            Apps
          </a>
          <a className={styles.navLink} href="#guides">
            Guides
          </a>
          <a className={styles.navLink} href="#about">
            About
          </a>
          <Link className={styles.navLink} href="/play">
            Games
          </Link>
          <Link className={styles.navLink} href="/support">
            Contact
          </Link>
          <Link className={styles.navLink} href="/privacy">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </main>
  );
}
