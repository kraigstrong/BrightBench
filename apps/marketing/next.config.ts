import type { NextConfig } from 'next';

const doublePuttOrigin = 'https://doubleputt.app';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'developer.apple.com',
        pathname: '/assets/elements/badges/**',
        protocol: 'https',
      },
    ],
  },
  // Double Putt's site moved to its own domain (apps/double-putt-site). Its pages here, at /doubleputt and before that
  // /double-putt, redirect there, media and all: the App Store listing and the game's Settings in builds already out
  // link to them. Its stats report stays here, as a tab of /stats, as does the analytics endpoint the game posts to
  // (/api/double-putt). Each game's old stats page goes to its tab; those redirects aren't permanent, so browsers don't
  // cache them while the viewer's addresses may still change.
  async redirects() {
    return [
      { destination: '/stats?game=double-putt', permanent: false, source: '/double-putt/stats' },
      { destination: `${doublePuttOrigin}/:path*`, permanent: true, source: '/double-putt/:path*' },
      { destination: doublePuttOrigin, permanent: true, source: '/doubleputt' },
      { destination: `${doublePuttOrigin}/:path`, permanent: true, source: '/doubleputt/:path((?!stats$).*)' },
      { destination: '/stats?game=bigger-fish', permanent: false, source: '/bigger-fish/stats' },
      { destination: '/stats?game=double-putt', permanent: false, source: '/doubleputt/stats' },
      { destination: '/stats?game=math-reef', permanent: false, source: '/math-reef/stats' },
    ];
  },
  transpilePackages: ['@education/design', '@education/legal-pages'],
};

export default nextConfig;
