import {
  buildDefaultPrivacySummary,
  buildDefaultSupportIntro,
} from '@education/legal-pages';

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@timetutor.app';
const timeTutorAppStoreUrl =
  process.env.NEXT_PUBLIC_TIME_TUTOR_APP_STORE_URL ||
  'https://apps.apple.com/app/time-tutor-clock-practice/id6761587276';

export const siteMeta = {
  description:
    'Small apps. Big learning moments. BrightBench builds focused educational apps for the concepts that are hardest to teach and hardest to make click.',
  supportEmail,
  timeTutorAppStoreUrl,
  title: 'BrightBench',
};

export const productCards = [
  {
    accent: '#E97A5F',
    blurb:
      'Build fraction intuition through seeing, estimating, comparing, and creating fractions.',
    href: '/products/fraction-finder',
    name: 'Fraction Finder',
    status: 'In progress',
  },
  {
    accent: '#E7A54B',
    appStoreUrl: timeTutorAppStoreUrl,
    blurb:
      'Practice analog, digital, and elapsed time with clean, tactile interactions.',
    href: '/products/time-tutor',
    name: 'Time Tutor',
    status: 'Live on the App Store',
  },
  {
    accent: '#6FA5D8',
    blurb: 'Early literacy practice for letter recognition, sounds, and fluency.',
    href: '/products/letter-bingo',
    name: 'Letter Bingo',
    status: 'Planned',
  },
  {
    accent: '#9A7AD6',
    blurb:
      'Build place-value understanding through visual grouping, movement, and number sense.',
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
