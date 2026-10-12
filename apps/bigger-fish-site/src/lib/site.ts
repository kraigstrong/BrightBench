/** The site's own domain. Production falls back to it; previews use their Vercel URL. */
export const productionOrigin = 'https://biggerfish.app';

const defaultContactEmail = 'support@brightbench.app';

/** The public TestFlight group for players who find the site (limited to 1,000). An empty setting hides it. */
const defaultTestFlightUrl = 'https://testflight.apple.com/join/qQ2FCuPa';

/** Apple's official App Store badge, used unmodified (developer.apple.com/app-store/marketing/guidelines). */
export const appStoreBadgeSrc = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';

export type SiteEnv = {
  appStoreId?: string;
  appStoreUrl?: string;
  contactEmail?: string;
  preorder?: string;
  siteOrigin?: string;
  testFlightUrl?: string;
  vercelEnv?: string;
  vercelUrl?: string;
};

/** Read with literal names so Next.js inlines the public values at build time. */
export function readEnv(): SiteEnv {
  return {
    appStoreId: process.env.NEXT_PUBLIC_BIGGER_FISH_APP_STORE_ID,
    appStoreUrl: process.env.NEXT_PUBLIC_BIGGER_FISH_APP_STORE_URL,
    contactEmail: process.env.NEXT_PUBLIC_BIGGER_FISH_CONTACT_EMAIL,
    preorder: process.env.NEXT_PUBLIC_BIGGER_FISH_PREORDER,
    siteOrigin: process.env.NEXT_PUBLIC_SITE_ORIGIN,
    testFlightUrl: process.env.NEXT_PUBLIC_BIGGER_FISH_TESTFLIGHT_URL ?? defaultTestFlightUrl,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  };
}

/** Canonical origin for metadata, the sitemap, and absolute links. */
export function siteOrigin(env: SiteEnv = readEnv()): string {
  const configured = env.siteOrigin?.trim().replace(/\/$/, '');
  if (configured) return configured;
  if (env.vercelEnv === 'production') return productionOrigin;
  if (env.vercelUrl) return `https://${env.vercelUrl}`;
  return 'http://localhost:3000';
}

function httpsUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && /^https:\/\//.test(trimmed) ? trimmed : undefined;
}

/**
 * What the site offers players. Apple's Download badge is licensed only for an app that's on the App Store, so a
 * pre-order gets a plain link instead (Apple doesn't host its pre-order badge), and before either the site says
 * "Coming soon" and, when there's a public TestFlight link, invites players into the beta.
 */
export type StoreCta =
  | { href: string; kind: 'download'; label: string }
  | { href: string; kind: 'preorder'; label: string }
  | { betaHref?: string; kind: 'comingSoon' };

export function storeCta(env: SiteEnv = readEnv()): StoreCta {
  const href = httpsUrl(env.appStoreUrl);
  if (href) {
    return env.preorder?.trim().toLowerCase() === 'true'
      ? { href, kind: 'preorder', label: 'Pre-order on the App Store' }
      : { href, kind: 'download', label: 'Download on the App Store' };
  }
  return { betaHref: httpsUrl(env.testFlightUrl), kind: 'comingSoon' };
}

/** The numeric App Store ID for Safari's Smart App Banner, when the app is on the store. */
export function appStoreId(env: SiteEnv = readEnv()): string | undefined {
  const id = env.appStoreId?.trim();
  return id && /^\d+$/.test(id) ? id : undefined;
}

export function contactEmail(env: SiteEnv = readEnv()): string {
  const email = env.contactEmail?.trim();
  return email && /^[^\s@]+@[^\s@]+$/.test(email) ? email : defaultContactEmail;
}
