/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Configure asset paths
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  // Configure rewrites for Netlify Functions in development
  async rewrites() {
    return [
      {
        source: '/.netlify/functions/:path*',
        destination: '/.netlify/functions/:path*',
      },
    ];
  },
  // Move pages directory to src/pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;