// Per-page <head> tags for the static web export at timetutor.app. Every page listed in
// public/sitemap.xml needs its own canonical and title; sharing the homepage's tells Google
// the page is a duplicate of the homepage and keeps it out of search.

export const SITE_URL = 'https://timetutor.app';
export const OG_IMAGE = `${SITE_URL}/favicon.png`;

export type WebHead = {
  canonical: string;
  description: string;
  title: string;
};

const HOME: WebHead = {
  canonical: SITE_URL,
  description:
    'Time Tutor helps children practice reading analog and digital time with simple, hands-on activities. No account required.',
  title: 'Time Tutor — Learn to Tell Time | Analog & Digital Clock Practice',
};

const PAGES: Record<string, WebHead> = {
  '/privacy': {
    canonical: `${SITE_URL}/privacy`,
    description: 'How Time Tutor handles information when you use the app and website.',
    title: 'Privacy Policy | Time Tutor',
  },
  '/support': {
    canonical: `${SITE_URL}/support`,
    description:
      'Get help with Time Tutor, the telling-time practice app for kids: contact support and read answers to common questions.',
    title: 'Support | Time Tutor',
  },
};

// In-app routes (modes, sessions, challenges) are kept out of search by robots.txt and fall
// back to the homepage tags.
export function getWebHead(pathname: string): WebHead {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PAGES[path] ?? HOME;
}
