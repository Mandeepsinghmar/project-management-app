await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['geist'],

  images: {
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: true, // Recommended by SST for NextjsSite
  },
};

export default config;
