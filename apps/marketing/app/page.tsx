import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { productCards, siteMeta } from '@/lib/site';
import styles from './home.module.css';

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

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.wordmark}>{siteMeta.title}</div>
        <nav className={styles.nav}>
          <a className={styles.navLink} href="#product-suite">
            Apps
          </a>
          <a className={styles.navLink} href="#about">
            About
          </a>
          <Link className={styles.navLink} href="/support">
            Contact
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
            Brightbench is building a suite of simple, thoughtful apps that
            help kids understand tough concepts with clarity and confidence.
          </p>
          <a className={styles.primaryButton} href="#product-suite">
            Explore the apps
          </a>
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
            Each Brightbench app is built around one concept and one goal:
            helping kids truly understand it.
          </p>
        </div>

        <div className={styles.cardGrid}>
          {productCards.map((product) => (
            <article
              className={`${styles.suiteCard} ${
                product.name === 'Time Tutor' ? styles.timeTutorCard : ''
              }`}
              key={product.name}
              style={{ '--card-accent': product.accent } as CSSProperties}>
              <div className={styles.cardAccent} />
              <h3 className={styles.cardTitle}>{product.name}</h3>
              <p className={styles.cardBody}>{product.blurb}</p>
              <div className={styles.cardFooter}>
                {product.name === 'Time Tutor' && product.appStoreUrl ? (
                  <a
                    className={styles.appStoreButton}
                    href={product.appStoreUrl}
                    rel="noreferrer"
                    target="_blank">
                    <Image
                      alt="Download on the App Store"
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

      <section className={styles.section}>
        <div className={styles.roadmap}>
          <div className={styles.roadmapTop}>
            <div className={styles.roadmapIntro}>
              <h2 className={styles.sectionTitle}>More focused apps are on the way</h2>
              <p className={styles.sectionText}>
                We’re actively building the next set of Brightbench apps around
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
            Brightbench is a growing suite of educational apps for elementary
            learners. We believe the hardest concepts to teach deserve tools
            that are simpler, more visual, and more thoughtfully designed.
          </p>
          <p className={styles.sectionText}>
            Our goal is not to build a giant curriculum platform. It is to
            create focused apps that help important ideas feel clear, intuitive,
            and even fun.
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
          <div className={styles.wordmark}>{siteMeta.title}</div>
          <p className={styles.footerLine}>Small apps. Big learning moments.</p>
        </div>

        <nav className={styles.footerNav}>
          <a className={styles.navLink} href="#product-suite">
            Apps
          </a>
          <a className={styles.navLink} href="#about">
            About
          </a>
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
