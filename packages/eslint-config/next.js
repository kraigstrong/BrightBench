const nextConfig = require('eslint-config-next/core-web-vitals');

module.exports = [
  ...nextConfig,
  {
    ignores: ['.next/*', 'coverage/*', 'next-env.d.ts'],
  },
];
