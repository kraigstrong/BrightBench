import type { NextConfig } from 'next';

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
  // Double Putt's pages moved under /doubleputt with its site: links to the old ones (the App Store listing's, and the
  // game's Settings in builds before the move) still land. Each game's stats page became a tab of /stats; those
  // redirects aren't permanent, so browsers don't cache them while the viewer's addresses may still change.
  async redirects() {
    return [
      { destination: '/doubleputt/:path*', permanent: true, source: '/double-putt/:path*' },
      { destination: '/stats?game=bigger-fish', permanent: false, source: '/bigger-fish/stats' },
      { destination: '/stats?game=double-putt', permanent: false, source: '/doubleputt/stats' },
      { destination: '/stats?game=math-reef', permanent: false, source: '/math-reef/stats' },
    ];
  },
  transpilePackages: ['@education/design', '@education/legal-pages'],
};

export default nextConfig;
