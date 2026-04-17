import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  getProductPageBySlug,
  productPages,
  siteMeta,
  type FaqItem,
  type PageCta,
  type ProductPage,
} from '@/lib/site';
import styles from '../../discovery.module.css';

function buildMetadata(page: ProductPage): Metadata {
  return {
    alternates: {
      canonical: `/products/${page.slug}`,
    },
    description: page.metaDescription,
    openGraph: {
      description: page.metaDescription,
      siteName: siteMeta.title,
      title: page.pageTitle,
      type: 'website',
      url: `/products/${page.slug}`,
    },
    robots:
      page.kind === 'placeholder'
        ? {
            follow: true,
            index: false,
          }
        : undefined,
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
  if (faqItems.length === 0) {
    return null;
  }

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

function TimeTutorJsonLd() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          applicationCategory: 'EducationalApplication',
          audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student',
          },
          description:
            'A telling time game for kids with analog clock practice, digital matching, and elapsed time support.',
          name: 'Time Tutor',
          offers: {
            '@type': 'Offer',
            url: siteMeta.timeTutorAppStoreUrl,
          },
          operatingSystem: 'iOS, Web',
          url: siteMeta.origin
            ? `${siteMeta.origin}/products/time-tutor`
            : '/products/time-tutor',
        }),
      }}
      type="application/ld+json"
    />
  );
}

export function generateStaticParams() {
  return productPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProductPageBySlug(slug);

  if (!page) {
    return {};
  }

  return buildMetadata(page);
}

export default async function ProductPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProductPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/">
        Back to BrightBench
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
        {'proofPoints' in page ? (
          <div className={styles.proofPoints}>
            {page.proofPoints.map((item) => (
              <span className={styles.proofPoint} key={item}>
                {item}
              </span>
            ))}
          </div>
        ) : null}
        <div className={styles.ctaRow}>
          {renderCta(page.primaryCta, styles.primaryButton)}
          {page.secondaryCta?.href
            ? renderCta(page.secondaryCta, styles.secondaryButton)
            : null}
          {page.secondaryCta?.note ? (
            <p className={styles.secondaryNote}>{page.secondaryCta.note}</p>
          ) : null}
        </div>
      </section>

      {page.kind === 'app' ? (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Why parents and teachers trust it</h2>
            <div className={styles.cardGrid}>
              {page.trustItems.map((item) => (
                <article className={styles.card} key={item.title}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Who it helps</h2>
            <div className={styles.sectionBody}>
              <p>
                Time Tutor is built for <strong>{page.audience}</strong> and works
                especially well for kids who need clock skills to feel more visual,
                more concrete, and less frustrating.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What kids learn</h2>
            <ul className={styles.list}>
              {page.learningItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <div className={styles.modeGrid}>
              {page.modeItems.map((item) => (
                <article className={styles.card} key={item.title}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Practice and challenge flow</h2>
            <ul className={styles.list}>
              {page.practiceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Where to use it</h2>
            <ul className={styles.list}>
              {page.usageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className={styles.placeholderPanel}>
          <p className={styles.note}>
            This is a roadmap page, not a finished search landing page. It stays
            simple on purpose until the product has enough public substance to stand
            on its own.
          </p>
          {page.sections.map((section) => (
            <div className={styles.sectionBody} key={section.title}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ))}
        </section>
      )}

      {page.faqItems.length > 0 ? (
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
      ) : null}

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
      {page.slug === 'time-tutor' ? <TimeTutorJsonLd /> : null}
    </main>
  );
}
