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
  // link to them. Its stats report stays here, as does the analytics endpoint the game posts to (/api/double-putt).
  async redirects() {
    return [
      { destination: '/doubleputt/stats', permanent: true, source: '/double-putt/stats' },
      { destination: `${doublePuttOrigin}/:path*`, permanent: true, source: '/double-putt/:path*' },
      { destination: doublePuttOrigin, permanent: true, source: '/doubleputt' },
      { destination: `${doublePuttOrigin}/:path`, permanent: true, source: '/doubleputt/:path((?!stats$).*)' },
    ];
  },
  transpilePackages: ['@education/design', '@education/legal-pages'],
};

export default nextConfig;
