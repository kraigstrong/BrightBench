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
  transpilePackages: ['@education/design', '@education/legal-pages'],
};

export default nextConfig;
