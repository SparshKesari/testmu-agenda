/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // Speaker/UI images are served from the TestMu assets CDN.
  images: { unoptimized: true },
};

module.exports = nextConfig;
