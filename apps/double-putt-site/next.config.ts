import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Apple's official App Store badges, used as-is.
    remotePatterns: [
      {
        hostname: 'developer.apple.com',
        pathname: '/assets/elements/badges/**',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
