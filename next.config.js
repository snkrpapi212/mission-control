/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true,
  },
  eslint: {
    dirs: ['src', 'convex'],
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Ensure App Router handles all routing
    optimizePackageImports: ['lucide-react'],
  },
  // Prevent Next.js from bundling next/document into client chunks
  // which breaks /404 prerendering in App Router
  serverExternalPackages: ['next/document'],
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    // Stub next/document for client builds to prevent /404 prerender crash
    if (!isServer) {
      config.resolve.alias['next/document'] = path.join(__dirname, 'src/lib/document-stub.js');
    }
    return config;
  },
};

module.exports = nextConfig;
