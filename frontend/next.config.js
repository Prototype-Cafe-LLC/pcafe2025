/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/sanjo_tsubame_calendar/:year/:month/:date",
        destination: "/api/sanjo_tsubame_calendar/:year/:month/:date",
      },
    ];
  },
  // 画像の最適化設定
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // 画像最適化を無効化
  },
};

module.exports = nextConfig;
