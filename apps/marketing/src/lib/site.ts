import {
  buildDefaultPrivacySummary,
  buildDefaultSupportIntro,
} from '@education/legal-pages';

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@timetutor.app';

export const siteMeta = {
  description:
    'BrightBench builds calm, polished educational apps that help kids build understanding through play.',
  supportEmail,
  title: 'BrightBench',
};

export const productCards = [
  {
    blurb: 'Build fraction intuition by seeing, estimating, and comparing.',
    href: '/products/fraction-finder',
    name: 'Fraction Finder',
    status: 'In progress',
  },
  {
    blurb: 'Practice analog, digital, and elapsed time with calm, tactile interactions.',
    href: '/products/time-tutor',
    name: 'Time Tutor',
    status: 'Live app',
  },
  {
    blurb: 'Grammar support built around short, focused practice.',
    href: '/products/grammar-guide',
    name: 'Grammar Guide',
    status: 'Planned',
  },
  {
    blurb: 'Early literacy play for letter recognition and fluency.',
    href: '/products/letter-bingo',
    name: 'Letter Bingo',
    status: 'Planned',
  },
  {
    blurb: 'Place-value intuition through visual grouping and movement.',
    href: '/products/place-value',
    name: 'Place Value',
    status: 'Planned',
  },
] as const;

export const supportConfig = {
  appName: siteMeta.title,
  supportEmail: siteMeta.supportEmail,
  supportIntro: buildDefaultSupportIntro(siteMeta.title),
};

export const privacyConfig = {
  appName: siteMeta.title,
  companyName: siteMeta.title,
  contactEmail: siteMeta.supportEmail,
  dataPracticesSummary: buildDefaultPrivacySummary(siteMeta.title),
};

export function getProductBySlug(slug: string) {
  return productCards.find(
    (product) => slugify(product.name) === slug,
  );
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-');
}
