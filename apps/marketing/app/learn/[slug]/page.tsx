import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppStoreBadgeLink } from '@/components/app-store-badge-link';
import {
  getLearnPageBySlug,
  learnPages,
  siteMeta,
  type FaqItem,
  type LearnPage,
  type PageCta,
} from '@/lib/site';
import styles from '../../discovery.module.css';

function buildMetadata(page: LearnPage): Metadata {
  return {
    alternates: {
      canonical: `/learn/${page.slug}`,
    },
    description: page.metaDescription,
    openGraph: {
      description: page.metaDescription,
      siteName: siteMeta.title,
      title: page.pageTitle,
      type: 'article',
      url: `/learn/${page.slug}`,
    },
    title: page.pageTitle,
    twitter: {
      card: 'summary_large_image',
      description: page.metaDescription,
      title: page.pageTitle,
    },
  };
}

function renderCta(cta: PageCta, className: string) {
  if (!cta.href) {
    return null;
  }

  if (cta.external) {
    if (cta.href.includes('apps.apple.com')) {
      return <AppStoreBadgeLink href={cta.href} label={cta.label} />;
    }

    return (
      <a
        className={className}
        href={cta.href}
        rel="noreferrer"
        target="_blank">
        {cta.label}
      </a>
    );
  }

  return (
    <Link className={className} href={cta.href}>
      {cta.label}
    </Link>
  );
}

function FaqJsonLd({ faqItems }: { faqItems: FaqItem[] }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
            name: item.question,
          })),
        }),
      }}
      type="application/ld+json"
    />
  );
}

export function generateStaticParams() {
  return learnPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLearnPageBySlug(slug);

  if (!page) {
    return {};
  }

  return buildMetadata(page);
}

export default async function LearnPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLearnPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/learn">
        Back to guides
      </Link>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>{page.heroEyebrow}</p>
        <h1 className={styles.heroTitle}>{page.h1}</h1>
        <div className={styles.intro}>
          {page.intro.map((paragraph) => (
            <p className={styles.lead} key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
        <div className={styles.ctaRow}>
          {renderCta(page.primaryCta, styles.primaryButton)}
          {page.secondaryCta ? renderCta(page.secondaryCta, styles.secondaryButton) : null}
        </div>
      </section>

      {page.sections.map((section) => (
        <section className={styles.section} key={section.title}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.sectionBody}>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul className={styles.list}>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick answers</h2>
        <div className={styles.faqGrid}>
          {page.faqItems.map((item) => (
            <article className={styles.faqCard} key={item.question}>
              <h3 className={styles.faqQuestion}>{item.question}</h3>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Related pages</h2>
        <div className={styles.relatedGrid}>
          {page.relatedLinks.map((link) => (
            <article className={styles.relatedCard} key={link.href}>
              <Link className={styles.relatedLink} href={link.href}>
                {link.label}
              </Link>
              <p className={styles.relatedDescription}>{link.description}</p>
            </article>
          ))}
        </div>
      </section>

      <FaqJsonLd faqItems={page.faqItems} />
    </main>
  );
}
