/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to allow dynamic API routes
  // output: 'export',
  images: {
    unoptimized: false, // Allow Next.js image optimization
  },
}

module.exports = nextConfig
