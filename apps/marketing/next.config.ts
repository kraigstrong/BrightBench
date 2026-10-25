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
  // game's Settings in builds before the move) still land.
  async redirects() {
    return [{ destination: '/doubleputt/:path*', permanent: true, source: '/double-putt/:path*' }];
  },
  transpilePackages: ['@education/design', '@education/legal-pages'],
};

export default nextConfig;
