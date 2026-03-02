/** @type {import('next').NextConfig} */
// No basePath for Android static export so Capacitor can load out/index.html
const nextConfig = {
  output: 'export',
  assetPrefix: '',
  env: { NEXT_PUBLIC_BASE_PATH: '' },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
