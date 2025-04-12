/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Configure rewrites for Netlify Functions in development
  async rewrites() {
    return [
      {
        source: '/.netlify/functions/:path*',
        destination: 'http://localhost:8888/.netlify/functions/:path*',
      },
    ];
  },
  // Move pages directory to src/pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;