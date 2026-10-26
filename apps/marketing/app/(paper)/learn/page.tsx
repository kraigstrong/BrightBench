import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { learnPages, productCards, siteMeta } from '@/lib/site';
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

const roadmapItems = [
  { name: 'Fraction Finder', status: 'In progress' },
  { name: 'Letter Bingo', status: 'Planned' },
  { name: 'Place Value', status: 'Planned' },
] as const;

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

        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.heroIllustration}>
            <div className={styles.heroPanel} />
            <div className={styles.heroArch} />
            <div className={styles.heroNotebook} />
            <div className={styles.heroPath} />
            <div className={styles.heroPathDots} />
            <div className={styles.heroAccentStar} />
            <div className={styles.heroAccentPill} />
            <div className={styles.heroFoxFrame}>
              <Image
                alt=""
                className={styles.heroFox}
                fill
                priority
                sizes="(max-width: 900px) 224px, 304px"
                src="/mascots/brightbench-fox-sitting.png"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.suiteSection} id="product-suite">
        <div className={styles.suiteHeader}>
          <div className={styles.eyebrow}>Product suite</div>
          <h2 className={styles.sectionTitle}>Focused apps for key skills</h2>
          <p className={styles.sectionText}>
            Each BrightBench app is built around one concept and one goal:
            helping kids truly understand it.
          </p>
        </div>

        <div className={styles.cardGrid}>
          {productCards.map((product) => (
            <article
              className={`${styles.suiteCard} ${
                product.availability === 'live' ? styles.liveCard : ''
              }`}
              key={product.name}
              style={{ '--card-accent': product.accent } as CSSProperties}>
              <div className={styles.cardAccent} />
              <h3 className={styles.cardTitle}>
                <Link className={styles.cardLink} href={product.href}>
                  {product.name}
                </Link>
              </h3>
              <p className={styles.cardBody}>{product.blurb}</p>
              <div className={styles.cardFooter}>
                {product.availability === 'live' && product.appStoreUrl ? (
                  <a
                    className={styles.appStoreButton}
                    href={product.appStoreUrl}
                    rel="noreferrer"
                    target="_blank">
                    <Image
                      alt={`Download ${product.name} on the App Store`}
                      className={styles.appStoreBadge}
                      height={40}
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                      unoptimized
                      width={120}
                    />
                  </a>
                ) : null}
                <div className={styles.status}>{product.status}</div>
              </div>
            </article>
          ))}
        </div>
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
            {roadmapItems.map((item) => (
              <div className={styles.roadmapRow} key={item.name}>
                <div className={styles.roadmapName}>{item.name}</div>
                <div
                  className={`${styles.roadmapStatus} ${
                    item.status === 'In progress'
                      ? styles.roadmapInProgress
                      : styles.roadmapPlanned
                  }`}>
                  {item.status}
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
